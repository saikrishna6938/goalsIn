import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import path from "path";
import fs from "fs/promises";
import { sendEmail } from "../EmailHelper";

class IndexController {
  index(req: Request, res: Response) {
    res.send(" Hello from controller");
  }

  async test(req: Request, res: Response) {
    const replaceString = ["#dedededededede"];
    const entry = searchStringMap["reset"];

    let emailTemplate = await fs.readFile(entry.filePath, "utf8");

    entry.searchString.map((r, i) => {
      emailTemplate = emailTemplate.replace(
        r,
        `${keys.appPath}session/reset-password/${replaceString[i]}`
      );
    });
    const subject = "User Registered Successfully";
    res.send(req.body);
  }

  async action_contactus(req: Request, res: Response) {
    try {
      const { name, email, message, phone } = req.body;

      if (!name || !email || !message || !phone) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const entry = searchStringMap["contact"];
      const replaceString = [name, email, phone, message];
      let emailTemplate = await fs.readFile(entry.filePath, "utf8");
      entry.searchString.map((r, i) => {
        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
      });
      const subject = `New contact request from  user:${name}`;
      sendEmail(emailTemplate, keys.contactUsEmail, subject);

      res.status(200).json({
        message:
          "Your enquiry has been received. We will get back to you soon.",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }

  async getDocumentTagById(req: Request, res: Response) {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing required parameter: id",
      });
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        "SELECT * FROM DocumentTagObject WHERE documentTagObjectId = ?",
        [id]
      );
      

      if ((rows as any[]).length === 0) {
        return res.status(404).json({
          success: false,
          message: "Document tag not found.",
        });
      }

      const row = rows[0] as any;

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
    } catch (error) {
      console.error("Error fetching document tag by ID:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch document tag by ID.",
      });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }

  async action_enroll(req: Request, res: Response) {
    try {
      const { name, email, message, location, phone } = req.body;

      if (!name || !email || !message || !phone) {
        return res.status(400).json({ message: "All fields are required." });
      }

      const entry = searchStringMap["enquiry"];
      const replaceString = [name, email, phone, location, message];
      let emailTemplate = await fs.readFile(entry.filePath, "utf8");
      entry.searchString.map((r, i) => {
        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
      });

      const subject = `Enroll Request from  user:${name}`;
      sendEmail(emailTemplate, keys.contactUsEmail, subject);

      res.status(200).json({
        message:
          "Your enquiry has been received. We will get back to you soon.",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }

  async action_submitFormWithFile(req: Request, res: Response) {
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
      const entry = searchStringMap["enquiry"];
      const replaceString = [name, email, phone, location, message];
      let emailTemplate = await fs.readFile(entry.filePath, "utf8");
      entry.searchString.map((r, i) => {
        emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
      });

      const subject = `New Job Application from  user:${name}`;

      // Create the attachment object using the buffer
      const attachments = [
        {
          filename: attachedFile.originalname, // Name of the uploaded file
          content: attachedFile.buffer, // The file content as a Buffer (in-memory)
        },
      ];

      // Send the email with the file as an attachment
      await sendEmail(emailTemplate, keys.contactUsEmail, subject, attachments);

      // Respond with success message
      res.status(200).json({
        message:
          "Your form submission has been received. We will get back to you soon.",
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    }
  }

  async action_subscribe(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res
          .status(400)
          .json({ message: "Name and email are required." });
      }
      connection = await mysql.createConnection(keys.database);

      const checkQuery = "SELECT * FROM Subscriptions WHERE email = ?";
      const [rows] = await connection.execute(checkQuery, [email]);

      //@ts-ignore
      if (rows.length > 0) {
        return res.status(409).json({ message: "User is already subscribed." });
      }

      const insertQuery = `INSERT INTO Subscriptions (name, email) VALUES (?, ?)`;
      await connection.execute(insertQuery, [name, email]);

      res.status(200).json({ message: "Subscription added successfully." });
    } catch (error) {
      console.error(error);
      // Handle any errors
      res
        .status(500)
        .json({ message: "Server error. Please try again later." });
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
  async addRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
    } catch (error) {
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
  async updateRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
    } catch (error) {
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
  async deleteRole(req: Request, res: Response) {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
    } catch (error) {
    } finally { if (connection) { try { await connection.end(); } catch {} } }
  }
}

export const indexcontroller: IndexController = new IndexController();

type SearchEntry = {
  filePath: string;
  searchString: RegExp[];
};

export const searchStringMap: { [key: string]: SearchEntry } = {
  register: {
    filePath: path.join(__dirname, "letters", "registration.html"),
    searchString: [/{{DASHBOARD_LINK}}/g, /{{USER_NAME}}/g],
  },
  reset: {
    filePath: path.join(__dirname, "letters", "forgotPassword.html"),
    searchString: [/{{RESET_LINK}}/g],
  },
  contact: {
    filePath: path.join(__dirname, "letters", "contact.html"),
    searchString: [
      /{{USER_NAME}}/g,
      /{{USER_EMAIL}}/g,
      /{{USER_PHONE}}/g,
      /{{USER_MESSAGE}}/g,
    ],
  },
  enquiry: {
    filePath: path.join(__dirname, "letters", "enquiry.html"),
    searchString: [
      /{{USER_NAME}}/g,
      /{{USER_EMAIL}}/g,
      /{{USER_PHONE}}/g,
      /{{LOCATION}}/g,
      /{{USER_MESSAGE}}/g,
    ],
  },
  resume: {
    filePath: path.join(__dirname, "letters", "resume.html"),
    searchString: [
      /{{USER_NAME}}/g,
      /{{USER_EMAIL}}/g,
      /{{USER_PHONE}}/g,
      /{{LOCATION}}/g,
      /{{USER_MESSAGE}}/g,
    ],
  },
};
