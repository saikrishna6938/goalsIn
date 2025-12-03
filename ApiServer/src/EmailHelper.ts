import nodemailer from "nodemailer";
import fs from "fs/promises";
import { frontEndPath } from "./config";

// Function to send email with attachment
export const sendEmail = async (
  emailTemplate,
  userEmail,
  subject,
  attachments = []
) => {
  const transporter = nodemailer.createTransport({
    host: "mail.gradwalk.us",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: "info@gradwalk.us", // Your email
      pass: "Gradwalk@6938", // Your password
    },
    tls: {
      rejectUnauthorized: false, // accept self-signed certificates temporarily
    },
  });

  const mailOptions = {
    from: "info@gradwalk.us", // sender address
    to: userEmail, // receiver
    subject: subject, // Subject line
    html: emailTemplate, // The HTML content of the email
    attachments: attachments, // Array of attachment objects
  };

  // Send email with attachment(s)
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
