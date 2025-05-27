const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'buithaibao2k4@gmail.com',
    pass: 'lxqw gaop cxkp vybp'
  }
});

module.exports = transporter; 