const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,       
    port: process.env.EMAIL_PORT,      
    secure: false,                      
    auth: {
      user: process.env.EMAIL_USERNAME, 
      pass: process.env.EMAIL_PASSWORD, 
    },
  });

  // 2) Define the email options
  const mailOptions = {
    from: `"Tt-mapApp" <${process.env.EMAIL_FROM}>`, 
    to: options.email,                                 
    subject: options.subject,                           
    text: options.message,                             
    html: options.html,                                 
  };

  // 3) Actually send the email
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

module.exports = sendEmail;