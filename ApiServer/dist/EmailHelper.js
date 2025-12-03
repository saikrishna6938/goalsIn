"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
// Function to send email with attachment
const sendEmail = (emailTemplate, userEmail, subject, attachments = []) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: "mail.gradwalk.us",
        port: 587,
        secure: false,
        auth: {
            user: "info@gradwalk.us",
            pass: "Gradwalk@6938", // Your password
        },
        tls: {
            rejectUnauthorized: false, // accept self-signed certificates temporarily
        },
    });
    const mailOptions = {
        from: "info@gradwalk.us",
        to: userEmail,
        subject: subject,
        html: emailTemplate,
        attachments: attachments, // Array of attachment objects
    };
    // Send email with attachment(s)
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("Error sending email:", error);
        }
        else {
            console.log("Email sent:", info.response);
        }
    });
});
exports.sendEmail = sendEmail;
//# sourceMappingURL=EmailHelper.js.map