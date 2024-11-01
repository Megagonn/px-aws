const { dbConfig } = require('../db/db');
const bcrypt = require('bcryptjs');
// const { createTempAccount, getAllBanks } = require('../helpers/flutterwave');
const { Notification } = require('../models/notification.model');
const { Transaction } = require('../models/transaction.model');
const { User } = require('../models/user.model');
const { sendMoney } = require('../helpers/monify');

// const topup = async (req, res) => {
//     try {
//         let body = req.body;
//         let account = await createTempAccount(body.email, body.amount, "Top up for me", "123asd345js-fkjd-34");
//         res.send(account);
//     } catch (error) {
//         console.log(error);
//         res.send({ status: false, payload: "Something went wrong. Topup failed." });
//     }
// }
const withdrawal = async (req, res) => {
    try {
        let body = req.body;
        // let w = await withdraw(body.bankCode, body.accountNumber, body.amount);
        // if (w.status) {
        let date = new Date().getTime();
        User.findOne({
            where: {
                email: body.email,
            }
        }).then(async (user) => {
            if (!(user.wallet > body.amount)) {
                res.send({ status: false, payload: "Insufficient fund.\nTry reducing the amount." })

            }
            if (user) {
                bcrypt.compare(body.password, user.password).then(async compared => {
                    if (!compared) {
                        res.send({ status: false, payload: "Incorrect password." })

                    } else {
                        let initiateWithdrawal = await sendMoney(user.account_number, body.details, body.amount);
                        if (!(initiateWithdrawal.status)) {
                            res.send(initiateWithdrawal);
                        } else {
                            
                            User.update({
                                wallet: user.wallet - parseInt(body.amount),
                            }, {
                                where: {
                                    email: user.email,
                                }
                            }).then(async (deduct) => {
                                await Notification.create({
                                    email: user.email,
                                    phone: user.phone,
                                    user_id: user.id,
                                    details: JSON.stringify({
                                        content: "You successfully initiated a withdrawal request.",
                                        timestamp: date,
                                    })
                                });
                                await Transaction.create({
                                    email: user.email,
                                    uid: user.uid,
                                    title: "Withdrawal",
                                    subtitle: `A sum of ₦${body.amount} has been withdrawed from your account`,
                                    type: "xpend",
                                    amount: body.amount,
                                    timestamp: date,
                
                                });
                                res.send(initiateWithdrawal);
                            })
                        }
                    }
                })

            } else {
                res.send({ status: false, payload: "User not found." })
            }
        })
    } catch (error) {
        console.log(error);
        res.send({ status: false, payload: "Something went wrong. Withdrawal failed." });
    }
}
// const banks = async (req, res) => {
//     try {
//         let allBanks = await getAllBanks();
//         res.send(allBanks);
//     } catch (error) {
//         console.log(error);
//         res.send({ status: false, payload: "Something went wrong. Failed to fetch banks.." });
//     }
// }

const setBudget = (req, res) => {
    try {
        User.findOne({
            where: {
                email: req.body.email,
            }
        }).then((user) => {
            if (user && user.wallet >= req.body.amount) {
                User.update({
                    budget: user.budget + parseInt(req.body.amount),
                    // wallet: user.wallet - parseInt(req.body.amount),
                }, {
                    where: {
                        email: user.email,
                    }
                }).then(async (budget) => {
                    let date = new Date().getTime();
                    await Transaction.create({
                        email: user.email,
                        uid: user.uid,
                        title: "Budget",
                        subtitle: `You set a budget of ₦${req.body.amount}`,
                        type: "xpend",
                        amount: req.body.amount,
                        timestamp: date,

                    });
                    res.send({ status: true, payload: `You have set a budget of ₦${req.body.amount}` })
                })
            } else {

                res.send({ status: false, payload: "Insufficient fund. Kind reduce your budget or top up your account." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong..." });

    }
}

const getBudget = (req, res) => {
    try {
        User.findOne({
            where: {
                uid: req.body.uid
            }
        }).then((user) => {
            if (user) {
                res.send({ status: true, payload: user.budget });
            } else {

                res.send({ status: false, payload: "User not found." });
            }
        })
    } catch (error) {

        res.send({ status: false, payload: "Something went wrong..." });
    }
}

// const withdraw = (req, res) => {
//     try {

//     } catch (error) {
//         res.send({ status: false, payload: "Something went wrong..." });

//     }
// }
module.exports = { setBudget, getBudget, withdrawal }