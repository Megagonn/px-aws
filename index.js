const express = require("express");
const app = express();
require('dotenv').config();
const { dbConfig } = require('./db/db');
const bodyParser = require('body-parser');
const port = 8080;//process.env.MYSQL_ADDON_PORT;
const userRoute = require('./routes/user.route');
const postRoute = require('./routes/post.route');
const adminRoute = require('./routes/admin.route');
const { Server } = require("socket.io");

const { createServer } = require("node:http");
const { xpend, addUser } = require("./controllers/user");
const { share, like, comment } = require("./controllers/post");
const { User } = require("./models/user.model");
const { Notification } = require("./models/notification.model");
const { Transaction } = require("./models/transaction.model");
const server = createServer(app);
const io = new Server(server);
// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html

// import {
//     SecretsManagerClient,
//     GetSecretValueCommand,
//   } from "@aws-sdk/client-secrets-manager";
  
//   const secret_name = "px-secret";
  
//   const client = new SecretsManagerClient({
//     region: "us-east-1",
//   });
  
//   let response;
  
//   try {
//     response = await client.send(
//       new GetSecretValueCommand({
//         SecretId: secret_name,
//         VersionStage: "AWSCURRENT", // VersionStage defaults to AWSCURRENT if unspecified
//       })
//     );
//   } catch (error) {
//     // For a list of exceptions thrown, see
//     // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
//     throw error;
//   }
  
//   const secret = response.SecretString;
  
  // Your code goes here
//db authentication
dbConfig.authenticate().then(async (_) => {
    await dbConfig.sync();
    console.log("DB authentication successful");
}).catch((err) => {
    console.log(err);
    dbConfig.authenticate().then((_) => {
        console.log("DB authentication successful");
    }).catch((err) => {
        dbConfig.authenticate().then((_) => {
            console.log("DB authentication successful");
        }).catch((err) => {
            console.log(err);
        });
        console.log(err);
    });
});

//middleware
app.use(express.static(__dirname + '/'));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000 }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Content-type:application/json");
    next();
});
app.get('/', (req, res) => res.send("Hello, world!\n\nWelcome to partie - xpender"));
app.get('/download_apk', (req, res) => res.sendFile(__dirname + '/partixpender.apk'));
app.use("/api/v0/users", userRoute);
app.use("/api/v0/posts", postRoute);
app.use("/api/v0/admins", adminRoute);


//webhooks
app.post('/api/v0/webhooks/monnify_webhooks', (req, res) => {
    let body = req.body;
    // const secretHash = process.env.FLW_SECRET_HASH;
    // const signature = req.headers["verif-hash"];
    // console.log(req.headers);
    // if (!signature || signature !== secretHash) {
    //     // This response is not from Flutterwave; discard
    //     // console.log(signature);
    //     // console.log(secretHash);
    //     // console.log(signature !== secretHash)
    //     return res.status(401).end();
    // }
    ///Successful top up
    if (body.eventType === 'SUCCESSFUL_TRANSACTION') {
        // if (body.data.status === 'successful') {
            let date = new Date().getTime();
            User.findOne({
                where: {
                    email: body.eventData.customer.email,
                }
            }).then((user) => {
                if (user) {
                    User.update({
                        wallet: user.wallet + body.eventData.settlementAmount,
                    }, {
                        where: {
                            email: user.email
                        }
                    }).then(async (update) => {
                        await Notification.create({
                            email: user.email,
                            phone: user.phone,
                            user_id: user.id,
                            details: JSON.stringify({
                                content: "Your purse has been credited successfully",
                                timestamp: date,
                            })
                        });
                        await Transaction.create({
                            email: user.email,
                            uid: user.uid,
                            title: "Purse funded",
                            subtitle: `A sum of ₦${body.eventData.settlementAmount} has been added into your account`,
                            type: "receive",
                            amount: body.eventData.settlementAmount,
                            timestamp: date,

                        });
                    })
                }
            })
        // }
    }
    if (body.eventType === 'SUCCESSFUL_DISBURSEMENT') {
        console.log(body);
        let date = new Date().getTime();
            User.findOne({
                where: {
                    email: body.eventData.customer.email,
                }
            }).then((user) => {
                if (user) {
                    User.update({
                        wallet: user.wallet - body.eventData.amount,
                    }, {
                        where: {
                            email: user.email
                        }
                    }).then(async (update) => {
                        await Notification.create({
                            email: user.email,
                            phone: user.phone,
                            user_id: user.id,
                            details: JSON.stringify({
                                content: "Your purse has been credited successfully",
                                timestamp: date,
                            })
                        });
                        await Transaction.create({
                            email: user.email,
                            uid: user.uid,
                            title: "Withdrawal",
                            subtitle: `Successful withdrawal of ₦${body.eventData.amount}.`,
                            type: "xpend",
                            amount: body.eventData.amount,
                            timestamp: date,

                        });
                    })
                }
            })
        
    }
    console.log(req.body);
    res.status(200).end()
})

io.on("connection", (socket) => {
    console.log(socket.handshake.url);
    console.log("someone connected");
    socket.on('xpending', (info) => {
        console.log(info);
        xpend(info.xpender, info.receiver, info.amount);
        socket.broadcast.emit("receiving", { receiver: info.receiver, amount: info.amount, xpender: info.xpender, username: info.username, image: info.image });
        socket.broadcast.emit("live_feed", { receiver: info.receiver, amount: info.amount, xpender: info.xpender, username: info.username, image: info.image });
    });
    socket.on('add_user', (info) => {
        console.log(info);
        addUser(info.xuid, info.ruid);
    });

    ///* Post events */
    socket.on('share', (info) => {
        share(info.id);
    })
    socket.on('likes', (info) => {
        like(info.id);
    })
    socket.on('comments', (info) => {
        comment(info);
    });

    /////
    socket.on('leader_board', async(info)=>{
        console.log("leader_board");
        console.log(info);
        
        User.findOne({
            where: {
                uid: info.uid
            }
        }).then(async(user)=>{
           if (user) {
            await User.update({
                 leader_board: info.data
             }, {
                 where: {
                     uid: user.uid
                 }
             })
           } 
        })
    })
})

app.get("/delete_account", (req, res)=>{
    res.sendFile(__dirname +'/static/delete_account.html');
});
app.get("/privacy", (req, res)=>{
    res.sendFile(__dirname +'/static/privacy.html');
});
app.get('/support', (req, res) => res.sendFile(__dirname +'/static/support.html'));
// app.get('/ita', (req, res) => res.sendFile(__dirname +'/static/ita.docx'));

server.listen(port, () => {
    console.log(`PartieXpender is listening on ${port}`);
});