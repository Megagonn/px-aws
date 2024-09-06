const { Admin } = require('../models/admin.model');
const cloudinary = require('cloudinary');
const formidable = require('formidable');
const bcrypt = require('bcryptjs');
const { default: Sendchamp } = require('sendchamp-sdk');
const { generatePassword, createTempFile } = require('../helpers/methods');
const { dbConfig } = require('../db/db');
const { Transaction } = require('../models/transaction.model');
// const { password } = require('../mail/mailer');

const sendchamp = new Sendchamp({
    mode: "live", // this is set to live by default
    publicKey: process.env.MAIL_TOKEN,
});

const email = sendchamp.EMAIL;
cloudinary.v2.config({
    cloud_name: 'dyqqhepm4',
    api_key: '269486766159385',
    api_secret: 'S2ldqsCEvZqpoA7axVs5-2JSPfc',
    secure: true,
});
const login = (req, res) => {
    try {
        Admin.findOne({
            where: {
                email: req.body.email,

            }
        }).then((admin) => {
            if (admin) {
                bcrypt.compare(req.body.password, admin.password).then((valid) => {
                    if (valid) {
                        if (admin.status == true) {
                            let { name, email, phone, role, imageURL, status, id } = admin;
                            res.send({ status: true, payload: { name, email, phone, role, imageURL, status, id } })
                        } else {

                            res.send({ status: false, payload: "Unauthorized access or access revoked.\nKindly reach out to the super admin" });
                        }
                    } else {
                        res.send({ status: false, payload: "Incorrect password" });
                    }
                })
            } else {
                res.send({ status: false, payload: "Invalid Credential" });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

const addAdmin = async (req, res) => {
    try {
        // let form = new formidable.IncomingForm();
        // form.parse(req.body, async (e, f, fi) => {
        // const blob = Buffer.from(f.image);
        let body = req.body;
        let generatedPassword = generatePassword(8);
        let salt = bcrypt.genSaltSync(10);
        let hashP = bcrypt.hashSync(generatedPassword, salt);
        var tempFilePath = await createTempFile(body.image);
        console.log(tempFilePath);
        (body.image != null || body.image != "") ? cloudinary.v2.uploader.upload(tempFilePath, {}, async (err, upload) => {
            if (err) {
                res.send({ status: false, payload: err.message });
            } else {
                console.log(generatedPassword);
                console.log(upload);
                console.log(upload.url);

                dbConfig.sync().then(() => {
                    Admin.findOne({
                        where: {
                            email: body.email
                        }
                    }).then((found) => {
                        if (found) {
                            res.send({ status: false, payload: "Admin already exist." });
                        } else {
                            Admin.create({
                                name: body.name,
                                email: body.email,
                                password: hashP,
                                phone: body.phone,
                                imageURL: upload.secure_url,
                                role: body.role,
                                status: true,
                            }).then(async (queryResult) => {
                                if (queryResult) {
                                    // await password(body.email, `${body.first_name + ' ' + body.last_name}`, generatedPassword,);
                                    res.send({ status: true, payload: "Admin onboarding successful." })
                                } else {
                                    res.send({ status: false, payload: "Something went wrong. Admin onboarding failed.\nPlease try agian." });
                                }
                            })
                        }
                    })
                })
            }
        }) : dbConfig.sync().then(() => {
            Admin.findOne({
                where: {
                    email: body.email
                }
            }).then((found) => {
                if (found) {
                    res.send({ status: false, payload: "Admin already exist." });
                } else {
                    Admin.create({
                        name: body.name,
                        email: body.email,
                        password: hashP,
                        phone: body.phone,
                        imageURL: upload.url,
                        role: body.role,
                        status: true,
                    }).then((queryResult) => {
                        if (queryResult) {
                            res.send({ status: true, payload: "Admin onboarding successful." })
                        } else {
                            res.send({ status: false, payload: "Something went wrong. Admin onboarding failed.\nPlease try agian." });
                        }
                    })
                }
            })
        })
        // })

    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

const suspendAdmin = (req, res) => {
    try {
        Admin.findOne({
            where: {
                email: req.body.email
            }
        }).then((admin) => {
            if (admin) {
                if (admin.role === "super") {
                    Admin.findOne({
                        where: {
                            email: req.body.data.email
                        }
                    }).then((a) => {
                        if (a) {
                            if (a.status) {
                                Admin.update({
                                    status: false,
                                }, {
                                    where: {
                                        email: req.body.data.email
                                    }
                                }).then((suspend) => {
                                    if (suspend) {
                                        res.send({ status: true, payload: `Admin ${req.body.data.email} access has been successfully revoked.` });
                                    } else {
                                        res.send({ status: false, payload: "Access suspension failed. Please try again." });
                                    }
                                })
                            } else {
                                res.send({ status: false, payload: "Access already revoked." });
                            }
                        } else {
                            res.send({ status: false, payload: "User not exist." });
                        }
                    })
                } else {

                    res.send({ status: false, payload: "Unauthorized access. You are not authorized for this action." });
                }
            } else {
                res.send({ status: false, payload: "Unauthorized access." });
            }
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

const resetPassword = (req, res) => {
    try {
        Admin.findOne({
            where: {
                email: req.body.email,
            }
        }).then(async (admin) => {
            if (admin) {
                let newPassword = req.body.password;
                await email.send({
                    subject: "ADMIN: NEW PASSWORD",
                    to: req.body.email,
                    from: "PARTIXPENDER",
                    message_body: `Hello ${admin.name}! \n Your new password is ${newPassword}.\nWarm regards,\nPARTIXPENDER Team.\n2024.`
                });
                let salt = await bcrypt.genSalt(10);
                let hashP = await bcrypt.hash(newPassword, salt);
                Admin.update({
                    password: hashP,
                }, {
                    where: {
                        email: req.body.email,
                    }
                }).then((update) => {
                    if (update) {
                        res.send({ status: true, payload: "Password reset successfully. Check your email for further instructions." })
                    } else {
                        res.send({ status: false, payload: "Something went wrong." });
                    }
                })
            } else {
                res.send({ status: false, payload: "User not found" });

            }
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

const allAdmin = (req, res) => {
    try {
        Admin.findAll().then((admins) => {
            res.send({ status: true, payload: admins });
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}
const allTransactions = (req, res) => {
    try {
        Transaction.findAll().then((transactions) => {
            res.send({ status: true, payload: transactions });
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

const updateProfile = async (req, res) => {
    try {
        let body = req.body;
        // console.log(body.image.typeof());
        console.log(typeof body.image);
        var tempFilePath = (typeof body.image == "string") ? body.image : await createTempFile(body.image);
        var i = body.image.typeof == "string" ? body.image : (await cloudinary.v2.uploader.upload(tempFilePath)).secure_url;
        Admin.update({
            name: body.name,
            phone: body.phone,
            imageURL: body.image.typeof == "string" ? body.image : i,
        }, {
            where: {
                email: body.email,
            }
        }).then((update) => {
            if (update) {
                res.send({ status: true, payload: "Profie updated successfully." })
            } else {
                res.send({ status: false, payload: "Profie update failed." })

            }
        })
    } catch (error) {
        res.send({ status: false, payload: error.message });
    }
}

module.exports = { login, addAdmin, suspendAdmin, resetPassword, allAdmin, updateProfile, allTransactions }