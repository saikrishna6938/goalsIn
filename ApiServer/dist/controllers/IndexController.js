"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.searchStringMap = exports.indexcontroller = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const EmailHelper_1 = require("../EmailHelper");
class IndexController {
    index(req, res) {
        res.send(" Hello from controller");
    }
    test(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const replaceString = ["#dedededededede"];
            const entry = exports.searchStringMap["reset"];
            let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
            entry.searchString.map((r, i) => {
                emailTemplate = emailTemplate.replace(r, `${keys_1.default.appPath}session/reset-password/${replaceString[i]}`);
            });
            const subject = "User Registered Successfully";
            res.send(req.body);
        });
    }
    action_contactus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, message, phone } = req.body;
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ message: "All fields are required." });
                }
                const entry = exports.searchStringMap["contact"];
                const replaceString = [name, email, phone, message];
                let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                entry.searchString.map((r, i) => {
                    emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                });
                const subject = `New contact request from  user:${name}`;
                (0, EmailHelper_1.sendEmail)(emailTemplate, keys_1.default.contactUsEmail, subject);
                res.status(200).json({
                    message: "Your enquiry has been received. We will get back to you soon.",
                });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ message: "Server error. Please try again later." });
            }
        });
    }
    getDocumentTagById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required parameter: id",
                });
            }
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const [rows] = yield connection.execute("SELECT * FROM DocumentTagObject WHERE documentTagObjectId = ?", [id]);
                if (rows.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "Document tag not found.",
                    });
                }
                const row = rows[0];
                res.json({
                    success: true,
                    data: {
                        documentTagObjectId: row.documentTagObjectId,
                        name: row.name,
                        description: row.description,
                        created: row.created,
                        updated: row.updated,
                        documentTagObject: JSON.parse(row.documentTagObject),
                    },
                });
            }
            catch (error) {
                console.error("Error fetching document tag by ID:", error);
                res.status(500).json({
                    success: false,
                    message: "Failed to fetch document tag by ID.",
                });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    action_enroll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, message, location, phone } = req.body;
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ message: "All fields are required." });
                }
                const entry = exports.searchStringMap["enquiry"];
                const replaceString = [name, email, phone, location, message];
                let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                entry.searchString.map((r, i) => {
                    emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                });
                const subject = `Enroll Request from  user:${name}`;
                (0, EmailHelper_1.sendEmail)(emailTemplate, keys_1.default.contactUsEmail, subject);
                res.status(200).json({
                    message: "Your enquiry has been received. We will get back to you soon.",
                });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ message: "Server error. Please try again later." });
            }
        });
    }
    action_submitFormWithFile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { name, email, message, location, phone } = req.body;
                // Validate required fields
                if (!name || !email || !message || !phone) {
                    return res.status(400).json({ message: "All fields are required." });
                }
                //@ts-ignore
                if (!req.file) {
                    return res.status(400).json({ message: "File is required." });
                }
                //@ts-ignore
                const attachedFile = req.file; // Access the uploaded file (from multer)
                const entry = exports.searchStringMap["enquiry"];
                const replaceString = [name, email, phone, location, message];
                let emailTemplate = yield promises_1.default.readFile(entry.filePath, "utf8");
                entry.searchString.map((r, i) => {
                    emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
                });
                const subject = `New Job Application from  user:${name}`;
                // Create the attachment object using the buffer
                const attachments = [
                    {
                        filename: attachedFile.originalname,
                        content: attachedFile.buffer, // The file content as a Buffer (in-memory)
                    },
                ];
                // Send the email with the file as an attachment
                yield (0, EmailHelper_1.sendEmail)(emailTemplate, keys_1.default.contactUsEmail, subject, attachments);
                // Respond with success message
                res.status(200).json({
                    message: "Your form submission has been received. We will get back to you soon.",
                });
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .json({ message: "Server error. Please try again later." });
            }
        });
    }
    action_subscribe(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                const { name, email } = req.body;
                if (!name || !email) {
                    return res
                        .status(400)
                        .json({ message: "Name and email are required." });
                }
                connection = yield mysql.createConnection(keys_1.default.database);
                const checkQuery = "SELECT * FROM Subscriptions WHERE email = ?";
                const [rows] = yield connection.execute(checkQuery, [email]);
                //@ts-ignore
                if (rows.length > 0) {
                    return res.status(409).json({ message: "User is already subscribed." });
                }
                const insertQuery = `INSERT INTO Subscriptions (name, email) VALUES (?, ?)`;
                yield connection.execute(insertQuery, [name, email]);
                res.status(200).json({ message: "Subscription added successfully." });
            }
            catch (error) {
                console.error(error);
                // Handle any errors
                res
                    .status(500)
                    .json({ message: "Server error. Please try again later." });
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    addRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
            }
            catch (error) {
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    updateRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
            }
            catch (error) {
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
    deleteRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
            }
            catch (error) {
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
}
exports.indexcontroller = new IndexController();
exports.searchStringMap = {
    register: {
        filePath: path_1.default.join(__dirname, "letters", "registration.html"),
        searchString: [/{{DASHBOARD_LINK}}/g, /{{USER_NAME}}/g],
    },
    reset: {
        filePath: path_1.default.join(__dirname, "letters", "forgotPassword.html"),
        searchString: [/{{RESET_LINK}}/g],
    },
    contact: {
        filePath: path_1.default.join(__dirname, "letters", "contact.html"),
        searchString: [
            /{{USER_NAME}}/g,
            /{{USER_EMAIL}}/g,
            /{{USER_PHONE}}/g,
            /{{USER_MESSAGE}}/g,
        ],
    },
    enquiry: {
        filePath: path_1.default.join(__dirname, "letters", "enquiry.html"),
        searchString: [
            /{{USER_NAME}}/g,
            /{{USER_EMAIL}}/g,
            /{{USER_PHONE}}/g,
            /{{LOCATION}}/g,
            /{{USER_MESSAGE}}/g,
        ],
    },
    resume: {
        filePath: path_1.default.join(__dirname, "letters", "resume.html"),
        searchString: [
            /{{USER_NAME}}/g,
            /{{USER_EMAIL}}/g,
            /{{USER_PHONE}}/g,
            /{{LOCATION}}/g,
            /{{USER_MESSAGE}}/g,
        ],
    },
};
//# sourceMappingURL=IndexController.js.map