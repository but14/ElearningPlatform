const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });

    const info = transporter.sendMail({
      from: "Elearning || by PagPag",
      to: email,
      subject: title,
      html: body,
    });

    return info;
  } catch (error) {
    console.log('Lỗi khi gửi thư - ', email);
  }
};

module.exports = mailSender;