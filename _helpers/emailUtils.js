const config = require('../config.json');
const cryptoUtils = require('./cryptoUtils');
const nodemailer = require('nodemailer');
const pug = require('pug');

module.exports = {
  sendMailWithResetPasswordLink,
  sendMailWithActiveLink,
};

function sendMailWithResetPasswordLink(toAddress, username, resetUrl) {
  const transporter = nodemailer.createTransport({
    service: config.emailServer.service,
    auth: {
      user: cryptoUtils.decrypt(config.emailServer.username),
      pass: cryptoUtils.decrypt(config.emailServer.password),
    },
  });

  const mailOptions = {
    from: config.emailServer.username,
    to: toAddress,
    subject: config.emailServer.resetPasswordSubject,
    html: pug.renderFile('templates/forgot-password-email.pug', {
      name: username,
      url: resetUrl,
    }),
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      throw 'The system cannot send reset link to your email. Please contact administrator for help';
    }
  });
}

function sendMailWithActiveLink(toAddress, username, resetUrl) {
  const transporter = nodemailer.createTransport({
    service: config.emailServer.service,
    auth: {
      user: cryptoUtils.decrypt(config.emailServer.username),
      pass: cryptoUtils.decrypt(config.emailServer.password),
    },
  });

  const mailOptions = {
    from: config.emailServer.username,
    to: toAddress,
    subject: config.emailServer.activeUserSubject,
    html: pug.renderFile("templates/active-email.pug", {
      name: username,
      url: resetUrl,
    }),
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log("Mail Error", error)
      throw "The system cannot send reset link to your email. Please contact administrator for help";
    }
  });
}
