

const { MailtrapClient } = require("mailtrap")

/**
 * For this example to work, you need to set up a sending domain,
 * and obtain a token that is authorized to send from the domain.
 */


const sendMail = (recipient, subject, content) => {
    const TOKEN = process.env.MAILTRAP_TOKEN_KEY;
    const SENDER_EMAIL = "hello@partyxpender.com";
    const RECIPIENT_EMAIL = recipient;

    const client = new MailtrapClient({ token: TOKEN });

    const sender = { name: "PartyXpender", email: SENDER_EMAIL };

    client.send({
        from: sender,
        to: [{ email: RECIPIENT_EMAIL }],
        subject: subject,
        text: content,
    })
        .then(console.log)
        .catch(console.error);
}
const newsMail = (recipients, subject, content) => {
    const TOKEN = process.env.MAILTRAP_TOKEN_KEY;
    const SENDER_EMAIL = "hello@partyxpender.com";
    // const RECIPIENT_EMAIL = recipients;

    const client = new MailtrapClient({ token: TOKEN });

    const sender = { name: "PartyXpender", email: SENDER_EMAIL };

    for (let i = 0; i < recipients.length; i++) {
        client
        .send({
            from: sender,
            to: [recipients[i]],
            subject: subject,
            // text: content,
            html: content,
        })
        .then(console.log)
        .catch(console.error);
        
    }
}

module.exports = { sendMail, newsMail }