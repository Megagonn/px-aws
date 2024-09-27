
// const formData = require('form-data');
// const Mailgun = require('mailgun.js');
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({ username: 'meg', key: process.env.MAILGUN_API_KEY });
// var nodemailer = require('nodemailer');

// var transporter = nodemailer.createTransport({
//     service: 'smtp.mailgun.org',
//     port: 587,
//     host: "smtp.mailgun.org",
//     auth: {
//         user: 'postmaster@sandbox3d50866775f34b129cc28922b27d0131.mailgun.org',
//         pass: '148d911c8fd1de2742832916eed595af-2b755df8-132ce894',
//     }
// });

// const smtpMail = (subject, to, content)=>{
//     var mailOptions = {
//         from:'mgt@partyxpender.com',
//         to: to,
//         subject: 'This is a test: test',
//         text:content,
//     }

//     transporter.sendMail(mailOptions, function(error, info) {
//         if (error) {
//             console.log(error);
//         } else {
//             console.log('Email sent: ' + info.response)
//         }
//     })
// }
// const sendMail = (subject, to, content) => {

//     mg.messages.create('sandbox3d50866775f34b129cc28922b27d0131.mailgun.org', {
//         from: "PARTYXPENDER <mgt@partyxpender.com>",
//         to: [to],
//         subject: subject,
//         text: content,
//         html: "<h1>Testing some Mailgun awesomness!</h1>"
//     })
//         .then(msg => console.log(msg)) // logs response data
//         .catch(err => console.error(err)); // logs any error
// }

const { MailtrapClient } = require("mailtrap")

/**
 * For this example to work, you need to set up a sending domain,
 * and obtain a token that is authorized to send from the domain.
 */


const sendMail = () => {
    const TOKEN = "2a6c325104e581ea8887b992dd3b8e56";
    // const TOKEN = "ed9c233e4479ddac0fe1a0bd9d26f07b";
    const SENDER_EMAIL = "hello@partyxpender.com";
    const RECIPIENT_EMAIL = "wolvedolph18@gmail.com";

    const client = new MailtrapClient({ token: TOKEN });

    const sender = { name: "PartyXpender", email: SENDER_EMAIL };

    client
        .send({
            from: sender,
            to: [{ email: RECIPIENT_EMAIL }],
            subject: "Hello from Partyxpender",
            text: "Welcome to Partyxpender Sending!",
        })
        .then(console.log)
        .catch(console.error);
}

module.exports = { sendMail }