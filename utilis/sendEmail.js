const nodemailer = require('nodemailer');

const sendEmail = (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_ADDRESS,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_ADDRESS,
    to: options.to,
    subject: options.subject,
    html: options.text,
  };

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log('Error Ocuured ' + err);
    } else {
      console.log('Email Send Successfully' + info.response);
    }
  });
};

/*const nodemailer = require('nodemailer');
const sendEmail = (options) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'your.gmail.account@gmail.com',
      pass: 'your.password',
    },
  });
  let mailOptions = {
    from: 'your.gmail.account@gmail.com',
    to: 'receivers.email@domain.com',
    subject: 'Test',
    text: 'Hello World!',
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error.message);
    }
    console.log('success');
  });
};*/
module.exports = sendEmail;
