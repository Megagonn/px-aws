
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'meg', key: process.env.MAILGUN_API_KEY });

const sendMail = (subject, to, content) => {

    mg.messages.create('sandbox-123.mailgun.org', {
        from: "PARTYXPENDER <mgt@partyxpender.com>",
        to: ["test@example.com"],
        subject: subject,
        text: content,
        html: "<h1>Testing some Mailgun awesomness!</h1>"
    })
        .then(msg => console.log(msg)) // logs response data
        .catch(err => console.error(err)); // logs any error
}

module.exports = { sendMail }