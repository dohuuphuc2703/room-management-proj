const nodeMailer = require("nodemailer");
const keys = require("../../config/secrets");

require("dotenv").config();

module.exports.sendMail = (to, subject, htmlContent) => {
  const transport = nodeMailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: false,
    auth: {
      user: keys.mailUsername,
      pass: keys.appPassword,
    },
  });

  const options = {
    from: `${process.env.APP_NAME} <${keys.mailUsername}>`,
    to: to,
    subject: subject,
    html: htmlContent,
  };

  return transport.sendMail(options);
};