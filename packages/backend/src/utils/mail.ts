import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_SMTP_HOST,
  port: process.env.MAIL_SMTP_PORT, // SMTP 非SSL端口25，SSL端口 465
  secure: process.env.MAIL_SMTP_SECURE === '1',
  auth: {
    user: process.env.MAIL_SMTP_USER,
    pass: process.env.MAIL_SMTP_PASS,
  },
});

export { transporter };
