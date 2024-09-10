
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'meg', key: process.env.MAILGUN_API_KEY });
var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
    service: 'smtp.mailgun.org',
    port: 587,
    host: "smtp.mailgun.org",
    auth: {
        user: 'postmaster@sandbox3d50866775f34b129cc28922b27d0131.mailgun.org',
        pass: '148d911c8fd1de2742832916eed595af-2b755df8-132ce894',
    }
});

const smtpMail = (subject, to, content)=>{
    var mailOptions = {
        from:'mgt@partyxpender.com',
        to: "test@example.com",
        subject: 'This is a test: test',
        text:content,
    }

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response)
        }
    })
}
const sendMail = (subject, to, content) => {

    mg.messages.create('sandbox3d50866775f34b129cc28922b27d0131.mailgun.org', {
        from: "PARTYXPENDER <mgt@partyxpender.com>",
        to: [to],
        subject: subject,
        text: content,
        html: "<h1>Testing some Mailgun awesomness!</h1>"
    })
        .then(msg => console.log(msg)) // logs response data
        .catch(err => console.error(err)); // logs any error
}

module.exports = { sendMail, smtpMail }