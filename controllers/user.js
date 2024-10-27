const bcrypt = require('bcryptjs');
// const mailer = require('../mail/mailer');
const jwt = require('jsonwebtoken');
const { dbConfig } = require('../db/db');
const { generateOtp, generateReferralCode, generatePassword, uuid } = require('../helpers/methods');
const { User } = require('../models/user.model');
const { Op, where } = require("sequelize");
const { Notification } = require('../models/notification.model');
const { createMonnifyAccount, fetchAccountDetails } = require('../helpers/monify');
const cloudinary = require('cloudinary');
const formidable = require('formidable');
const { Transaction } = require('../models/transaction.model');
const { sendMail } = require('../helpers/mailer');
const { Accounts } = require('../models/accounts.model');
// const { default: Sendchamp } = require('sendchamp-sdk');
// const { sdk } = require("sendchamp");

// const sendchamp = new Sendchamp({
//     mode: "live", // this is set to live by default
//     publicKey:
//         process.env.MAIL_TOKEN,
// });

// const sms = sendchamp.SMS;
// const verification = sendchamp.VERIFICATION;
// const sendEmail = sendchamp.EMAIL;

cloudinary.v2.config({
    cloud_name: 'dyqqhepm4',
    api_key: '269486766159385',
    api_secret: 'S2ldqsCEvZqpoA7axVs5-2JSPfc',
    secure: true,
});

const allUsers = (req, res) => {
    try {
        User.findAll({}).then((results) => {
            if (results.length > 0) {
                res.send({ status: true, payload: results });
            } else {
                res.send({ status: true, payload: [] });
            }
        })
    } catch (error) {

        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const signup = async (req, res) => {
    try {
        const body = req.body;
        let date = new Date().getTime();
        console.log(body);
        dbConfig.sync().then(() => {
            if (body.email.toString().trim() != '') {
                User.findAll({
                    where: {
                        [Op.or]: [
                            { email: body.email },
                            { phone: body.phone }
                        ],
                    }
                }).then((queryResult) => {
                    if (queryResult.length > 0) {
                        console.log(queryResult);
                        res.send({ status: false, payload: "Email or Phone number already exists!" });
                        // res.end();
                    } else {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(body.password, salt).then(async (hash) => {
                                console.log(hash);
                                const email = body.email;
                                // Create token
                                const jwtoken = jwt.sign(
                                    { user_id: email, email },
                                    process.env.TOKEN_KEY,
                                    { expiresIn: "3600s" }
                                );
                                var userotp = { otp: generateOtp(), timestamp: date }
                                var dva = await createMonnifyAccount(body);
                                console.log(dva);
                                /// * * * Uncomment the above line once the Paystack setup is completed.

                                if (dva.status) {
                                    let uid = uuid(body.phone);
                                    User.create({
                                        first_name: body.first_name,
                                        last_name: body.last_name,
                                        email: body.email,
                                        username: `@${body.first_name}_${body.last_name}`,
                                        uid: uid,
                                        leader_board: JSON.stringify([{
                                            leader_board: "Xpending",
                                            amount: 0,
                                            timestamp: Date.now(),
                                        }]),
                                        phone: body.phone,
                                        country_code: body.country_code ?? "+234",
                                        password: hash,
                                        token: jwtoken,
                                        otp: JSON.stringify(userotp),
                                        wallet: 0,
                                        total_xpent: 0,
                                        list: JSON.stringify([]),
                                        // referral_code: generateReferralCode(body.first_name, body.phone),
                                        account_number: uid,
                                        // account_number: dva.payload.account_number,

                                    }).then(async (result) => {
                                        console.log(result);
                                        if (result) {
                                            await Promise.all([
                                                await Accounts.create({
                                                    name: '',
                                                    account_name: dva.payload.accountName,
                                                    account_number: dva.payload.accounts[0].accountNumber,
                                                    account_reference: dva.payload.accountReference,
                                                    account_email: dva.payload.customerEmail,
                                                    currency_code: dva.payload.currencyCode,
                                                    bank_code: dva.payload.accounts[0].bankCode,
                                                    bank_name: dva.payload.accounts[0].bankName,
                                                    status: dva.payload.status,
                                                    reservation_reference: dva.payload.reservationReference,
                                                }),
                                                await Notification.create({
                                                    user_id: result.id,
                                                    email: result.email,
                                                    phone: result.phone,
                                                    details: JSON.stringify({
                                                        content: "Welcome to PartieXpender",
                                                        timestamp: date,
                                                    }),
                                                }),
                                                sendMail(result.email, "Welcome to PartieXpender.", "Welcome to PARTYXPENDER! 🎉\n\nWe’re excited to have you join our community. Explore, xpend & enjoy, and make the most of all the features we’ve designed to help you enjoy your time. If you need any assistance, our support team is here to help.\n\nLet’s get started on this exciting experience together!"),
                                                sendMail(result.email, "PARTYXPENDER - SIGNUP OTP", `Welcome to PARTYXPENDER! 🎉\n\nYour otp is ${userotp.otp}, it will expire in 15 minutes. Do not share with anyone. \n\nIf you do not initiate this request, kindly reply to this email or get in touch with us via Whatsapp or phone with +234-901-9517-438`),

                                            ])
                                            res.send({ status: true, payload: { msg: "Registration successful!", id: result.id, token: jwtoken, email: result.email, phone: result.phone, uid: result.uid } });
                                        } else {
                                            res.send({
                                                status: false,
                                                payload: "Registration failed."
                                            });
                                        }

                                    })

                                } else {
                                    res.send({
                                        status: false,
                                        payload: `Registration failed. ${dva.payload}`
                                    });
                                }
                            });
                        })

                    }
                });
            } else {
                res.send({
                    status: false,
                    payload: "error.message",
                    message: "Something went wrong!"
                })
            }
        })
    } catch (error) {
        res.send({
            status: false,
            payload: error,
            message: "Something went wrong!"
        })
    }
}


const login = (req, res) => {
    try {
        let body = req.body;
        if (body.email.toString().trim() != "") {
            User.findOne({
                where: {
                    [Op.or]: [
                        { email: body.email, },
                        // { phone: body.phone, },
                    ]
                }
            }).then(async (queryResult) => {
                // var dva = await createAndAssignDVA(queryResult.email, queryResult.first_name, queryResult.last_name, queryResult.phone);
                // console.log(dva);
                if (queryResult) {
                    var a = await createMonnifyAccount(queryResult);
                    console.log(a);

                    bcrypt.compare(body.password, queryResult.password).then((result) => {
                        if (result) {
                            const email = body.email;
                            // Create token
                            const jwtoken = jwt.sign(
                                { user_id: email, email },
                                process.env.TOKEN_KEY,
                                { expiresIn: "18000s" }
                            );
                            User.update({
                                token: jwtoken
                            }, {
                                where: {
                                    [Op.or]: [
                                        { email: body.email, },
                                        // { phone: body.phone, },
                                    ]
                                }
                            }).then(async (update) => {
                                if (update) {
                                    let { id, email, phone, image_URL, first_name, last_name, uid, username } = queryResult;
                                    // sendMail();
                                    // sendMail(email, "PARTYXPENDER - SIGNUP OTP", `Welcome to PARTYXPENDER! 🎉\n\nYour otp is 3478, it will expire in 15 minutes.`),
                                    res.status(200).send({
                                        status: true,
                                        payload: {
                                            token: jwtoken,
                                            user: { id, email, phone, image_URL, first_name, last_name, uid, username },
                                        }
                                    })
                                } else {
                                    res.send({
                                        status: false,
                                        payload: "Something went wrong. Please try again."
                                    })
                                }
                            })
                        } else {
                            res.send({
                                status: false,
                                payload: "Invalid password."
                            });
                        }
                    })
                } else {
                    res.send({
                        status: false,
                        payload: "Invalid credentials."
                    })
                }
            });
        } else {
            res.send({
                status: false,
                payload: "Invalid credentials."
            })
        }
    } catch (error) {
        res.send({
            status: false,
            payload: "Invalid credentials."
        })
    }
}

const bioMetricLogin = (req, res) => {
    try {
        let body = req.body;
        User.findOne({
            where: {
                [Op.or]: [
                    { email: body.email, },
                    // { phone: body.phone, },
                ]
            }
        }).then(async (queryResult) => {
            // var dva = await createAndAssignDVA(queryResult.email, queryResult.first_name, queryResult.last_name, queryResult.phone);
            // console.log(dva);
            if (queryResult) {
                const email = body.email;
                // Create token
                const jwtoken = jwt.sign(
                    { user_id: email, email },
                    process.env.TOKEN_KEY,
                    { expiresIn: "3600s" }
                );
                User.update({
                    token: jwtoken
                }, {
                    where: {
                        [Op.or]: [
                            { email: body.email, },
                            // { phone: body.phone, },
                        ]
                    }
                }).then(async (update) => {
                    if (update) {
                        let { id, email, phone, image_URL, first_name, last_name, uid } = queryResult;
                        res.status(200).send({
                            status: true,
                            payload: {
                                token: jwtoken,
                                user: { id, email, phone, image_URL, first_name, last_name, uid },
                            }
                        })
                    } else {
                        console.log(update);
                        res.send({
                            status: false,
                            payload: "Something went wrong. Please try again."
                        })
                    }
                })
            } else {
                res.send({
                    status: false,
                    payload: "User must login, at least once, with email and password before they can use biometric login features."
                })
            }
        });
    } catch (error) {
        console.log(error);
        res.send({
            status: false,
            payload: "Something went wrong. Please try again."
        })
    }
}

const resendOtp = async (req, res) => {
    try {
        let body = req.body;
        let date = new Date().getTime();
        console.log(date);
        if (body.email.trim() != "") {
            var userotp = { otp: generateOtp(), timestamp: date }

            User.update({
                otp: JSON.stringify(userotp)
            }, {
                where: {
                    [Op.or]: [
                        { email: body.email },
                    ]
                }
            }).then(async (update) => {
                console.log(update);
                if (update) {
                    sendMail(body.email, "PARTYXPENDER - RESEND OTP", `Hi, \n\nYour otp is ${userotp.otp}, it will expire in 15 minutes. Do not share with anyone. \n\nIf you do not initiate this request, kindly reply to this email or get in touch with us via Whatsapp or phone with +234-901-9517-438`),

                        res.send({ status: true, payload: "OTP has been resent successfully. Expires in 15 minutes." });
                } else {
                    res.send({ status: false, payload: "Couldn't resend OTP. Invalid email." })
                }
            })
        } else {
            res.send({ status: false, payload: "Couldn't resend OTP.\nEnter a valid email address." })
        }
    } catch (error) {
        console.log(error);
        res.send({ status: false, payload: "Couldn't resend OTP" })

    }
}

const verifyOTP = (req, res) => {
    try {
        let body = req.body;
        User.findOne({
            where: {
                [Op.or]: [
                    { email: body.email },
                ]
            }
        }).then((queryResult) => {
            if (queryResult) {
                let otp = JSON.parse(queryResult.otp);
                let isOTPMatch = otp.otp == body.otp;
                if (isOTPMatch) {
                    let newdate = new Date().getMinutes();
                    console.log(newdate);
                    console.log(otp);
                    let otpmin = new Date(otp.timestamp).getMinutes();
                    console.log(otpmin);
                    if (newdate > (otpmin + 5)) {
                        // console.log("OTP expires....");
                        res.send({ status: false, payload: "OTP has expired. Click resend to get a new one." });
                    } else {
                        // console.log("OTP not expires....");
                        if (!queryResult.is_active) {
                            User.update({
                                is_active: true,
                                email_verified: true,
                                phone_verified: true
                            }, {
                                where: {
                                    email: queryResult.email
                                }
                            }).then((update) => {

                                res.send({ status: true, payload: "OTP verification successful." })
                            })
                        } else {
                            res.send({ status: true, payload: "OTP verification successful." })

                        }

                    }
                    // console.log(isVerified);
                    // res.end();
                } else {
                    res.send({ status: false, payload: "Invalid OTP." })
                }

            } else {
                res.send({ status: false, payload: "Incorrect email or phone." });
                // res.end();

            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
        // res.end();

    }
}

const resetPassword = (req, res) => {
    try {
        let body = req.body;
        if (body.newPassword.trim().length != 0) {
            User.findOne({
                where: {
                    [Op.or]: [
                        { email: body.email },
                        { phone: body.phone }
                    ]
                }
            }).then((queryResult) => {
                let comparePassword = bcrypt.compareSync(body.newPassword, queryResult.password);
                if (comparePassword) {
                    res.send({ status: false, payload: "You cannot use the old password as the new password. Please try again." });
                } else {
                    if (queryResult) {
                        bcrypt.genSalt(10, (err, salt) => {
                            bcrypt.hash(body.newPassword, salt).then((hash) => {
                                User.update({
                                    password: hash
                                }, {
                                    where: {
                                        [Op.or]: [
                                            { email: body.email },
                                            { phone: body.phone }
                                        ]
                                    }
                                }).then((result) => {
                                    if (result) {
                                        res.send({ status: true, payload: "Password reset successfully." });
                                    } else {
                                        res.send({ status: false, payload: "Incorrect email or phone." });

                                    }
                                });
                            })
                        })
                    } else {
                        res.send({ status: false, payload: "Email or phone not found." });

                    }
                }
            })
        } else {

            res.send({ status: false, payload: "Password cannot be empty." });
        }
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });

    }
}

const addAddress = (req, res) => {
    try {
        let body = req.body;
        User.findOne({
            where: {
                [Op.or]: [
                    { email: body.email },
                    { phone: body.phone }
                ]
            }
        }).then((queryResult) => {
            if (queryResult) {
                User.update({
                    address: body.address,
                }, {
                    where: {
                        [Op.or]: [
                            { email: body.email },
                            { phone: body.phone }
                        ]
                    }
                }).then((update) => {
                    if (update) {
                        res.send({ status: true, payload: "Address added successfully." });
                    } else {
                        res.send({ status: false, payload: "Update failed." });
                    }
                })
            } else {
                res.send({ status: false, payload: "Email or phone not found." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });

    }
}

const getUser = (req, res) => {
    try {
        let body = req.body;
        User.findOne({
            where: {
                id: body.userId
            }
        }).then((user) => {
            if (user) {
                let token = body.token || req.headers.authorization;
                // let isTokenValid = true;
                jwt.verify(token.split(" ")[1], process.env.TOKEN_KEY, (err, decoded) => {
                    if (err) {
                        res.send({ status: false, payload: "This session has expired. Login again." });
                    } else if (token.split(" ")[1] == user.token) {

                        let { id, first_name, last_name, email, phone, img_URL, wallet, uid, username, leader_board, account_number, image_URL } = user;
                        res.send({ status: true, payload: { id, first_name, last_name, email, phone, img_URL, wallet, uid, username, leader_board, account_number, image_URL } })
                    } else {
                        res.send({ status: false, payload: "This session has expired. Login again." });
                    }
                });

            } else {
                res.send({ status: false, payload: "User not found." });
            }


        });
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const getAllUsers = (req, res) => {
    try {
        User.findAll({}).then((users) => {
            if (users) {
                res.send({ status: true, payload: users })
            } else {

                res.send({ status: false, payload: "No user found." })
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });

    }
}

const notification = (req, res) => {
    try {
        Notification.findAll({
            where: {
                user_id: req.body.id,
            }
        }).then((queryResult) => {
            if (queryResult) {
                res.send({ status: true, payload: queryResult });
            } else {
                res.send({ status: false, payload: "Nothing was found." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const updateProfile = (req, res) => {
    try {
        let body = req.body;
        User.findOne({
            where: {
                [Op.or]: {
                    email: body.email,
                    // phone: body.phone,
                }
            }
        }).then((queryResult) => {
            if (queryResult) {
                User.update({
                    first_name: body.first_name || queryResult.first_name,
                    last_name: body.last_name || queryResult.last_name,
                    username: body.username || queryResult.username,
                }, {
                    where: {
                        email: queryResult.email
                    }
                }).then((update) => {
                    if (update) {
                        res.send({ status: true, payload: "Profile updated successfully." });
                    } else {

                        res.send({ status: false, payload: "Profile updated failed." });
                    }
                })
            } else {
                res.send({ status: false, payload: "User not found." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const addImageURL = (req, res) => {
    let form = new formidable.IncomingForm();
    try {
        form.parse(req, async (err, fields, files) => {
            console.log(files);
            console.log(fields);
            if (err) {
                console.log(err);
                res.send({ status: false, payload: "Something went wrong. Please try again." });
            } else {
                await cloudinary.v2.uploader.upload(files.image[0].filepath, {

                }, (err, result) => {
                    if (err) {
                        console.log(err);
                        res.send({ status: false, payload: "Something went wrong. Please try again." })
                    } else {
                        User.update({
                            image_URL: result.secure_url
                        }, {
                            where: {
                                email: fields.email
                            }
                        }).then((upload) => {
                            if (upload) {

                                res.send({ status: true, payload: "Profile picture updated successfully.", url: result.url });
                            } else {
                                res.send({ status: false, payload: "Something went wrong. Please try again." });
                            }
                        })
                    }
                });
            }

        })
    } catch (error) {
        console.log(error);
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const topup = (req, res) => {
    let body = req.body;
    let date = new Date().getTime();
    console.log(body);
    try {
        User.findOne({
            where: {
                id: body.id
            }
        }).then((user) => {
            let newBalance = user.wallet + body.amount;
            if (user) {
                User.update({
                    wallet: newBalance
                }, {
                    where: {
                        id: body.id
                    }
                }).then(async (update) => {
                    await Notification.create({
                        email: user.email,
                        phone: user.phone,
                        user_id: user.id,
                        details: JSON.stringify({
                            timestamp: date,
                            content: `Your topup of ${body.amount} was successful.`
                        }),
                    });
                    if (update) {
                        res.send({ status: true, payload: "Topup was successful." })
                    } else {
                        res.send({ status: false, payload: "Topup failed." })

                    }
                })
            } else {
                res.send({ status: false, payload: "User not found." })
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const getBalance = (req, res) => {
    try {
        User.findOne({
            where: {
                uid: req.body.uid,
            }
        }).then((user) => {
            if (user) {
                res.send({ status: true, payload: user.wallet })
            } else {
                res.send({ status: false, payload: "User not found." })
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const deleteAccount = (req, res) => {
    try {
        User.findOne({
            where: {
                email: req.body.email
            }
        }).then((user) => {
            User.update({
                is_active: false,
            }, { where: { email: user.email } }).then((updated) => {
                if (updated) {
                    res.send({ status: true, payload: "Account deleted successfully.\n You can still reactivate your account before 30 days." })
                } else {
                    res.send({ status: false, payload: "Account deletion failed" })
                }
            })
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const xpend = (xuid, ruid, amount) => {
    try {
        User.findOne({
            where: {
                uid: xuid,
            }
        }).then(async (xpender) => {
            console.log(xpender.budget > amount);
            console.log(xpender);


            if (xpender && (xpender.budget > amount || xpender.wallet > amount)) {
                console.log("seen xpender");
                //! deduct amount from xpender
                await User.update({
                    budget: xpender.budget > amount ? xpender.budget - amount : xpender.budget,
                    wallet: xpender.wallet - amount,
                    total_xpent: xpender.total_xpent + amount,
                }, {
                    where: {
                        uid: xuid
                    }
                });
                await Transaction.create({
                    email: xpender.email,
                    uid: xpender.uid,
                    title: "You sprayed",
                    subtitle: "You just sprayed",
                    amount: amount,
                    timestamp: Date.now(),
                    type: "xpend"
                });
                User.findOne({
                    where: {
                        uid: ruid,
                    }
                }).then(async (receiver) => {
                    if (receiver) {
                        console.log("seen receiver");
                        //* add amount to receiver
                        await User.update({
                            wallet: receiver.wallet + amount,
                            total_received: receiver.total_received + amount,
                        }, {
                            where: {
                                uid: ruid
                            }
                        });

                        /// notification
                        //    await Notification.bulkCreate()
                        await Transaction.create({
                            email: receiver.email,
                            uid: receiver.uid,
                            title: "You just got sprayed",
                            subtitle: "just sprayed you",
                            amount: amount,
                            timestamp: Date.now(),
                            type: "receive"
                        });
                    }
                });
            }
        });

    } catch (error) {

    }
}

const addUser = (xuid, ruid) => {
    try {
        User.findOne({
            where: {
                uid: xuid,
            }
        }).then(async (xpender) => {
            if (xpender) {
                let pp = JSON.parse(xpender.list);
                console.log(pp);
                User.findOne({
                    where: { uid: ruid }
                }).then(async (user) => {
                    let a = [];
                    if (user) {
                        let search = pp.find((v, i, a) => {
                            return v.uid == ruid;
                        })
                        console.log(`This is search result${search}`);

                        if (!search) {
                            let { uid, username, image_URL } = user;
                            pp.push({ uid, username, image_URL });
                            await User.update({
                                // list: JSON.stringify([{ uid, username, image_URL }])
                                list: JSON.stringify(pp)
                            }, { where: { uid: xuid } });
                        } else {
                            console.log("User found");

                        }
                    } else {

                    }
                })
            } else {
                console.log(`${ruid} not found`);
            }
        })
    } catch (error) {
        console.log(error);

    }
}

const getList = (req, res) => {
    try {
        User.findOne({
            where: { id: req.body.id }
        }).then((user) => {
            if (user) {
                let list = JSON.parse(user.list);
                res.send({ "status": true, "payload": list });
            } else {

                res.send({ status: false, payload: "User not found" });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}
const fetchTransactions = (req, res) => {
    try {
        Transaction.findAll({
            where: { uid: req.body.uid, }
        }).then((transaction) => {
            if (transaction) {
                res.send({ "status": true, "payload": transaction });
            } else {
                res.send({ status: false, payload: "User not found." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });
    }
}

const getLeaderboard = (req, res) => {
    try {
        User.findOne({
            where: {
                email: req.body.email,
            }
        }).then((user) => {
            if (user) {
                let board = JSON.parse(user.leader_board);
                // console.log(board);
                // console.log((board[0]));
                // console.log((board[0].leader_board));

                res.send({
                    status: true, payload: { leader_board: user.leader_board, xpent: user.total_xpent, uid: user.uid }
                })
            } else {
                res.status(404).end();
            }
        })
    } catch (error) {
        res.send({ status: false, payload: "Something went wrong. Please try again." });

    }
}

const getAccountDetails = async (req, res) => {
    try {
        var response = await fetchAccountDetails(req.body.ref);
        console.log(response);
        res.send(response);

    } catch (error) {
        console.log(error);

        return { status: false, payload: error }
    }
}

module.exports = { allUsers, signup, login, resendOtp, verifyOTP, resetPassword, addAddress, getUser, notification, updateProfile, deleteAccount, addImageURL, topup, getBalance, bioMetricLogin, xpend, addUser, getList, fetchTransactions, getLeaderboard, getAllUsers, getAccountDetails };