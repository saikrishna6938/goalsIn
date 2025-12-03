import { Request, Response } from "express";
import keys from "../keys";
import { User, UserSqlObject, updateUserQuery } from "../modules/User";
import { generateJWTSecretKey } from "../utils/jwt.utils";
import SessionManager from "../session/SessionManager";
import * as mysql from "mysql2/promise";
import pool from "../database";
import * as crypto from "crypto";
import * as jwt from "jsonwebtoken";
import fs from "fs/promises";
import path from "path";
import { sendEmail } from "../EmailHelper";
import { buildUserDashboardData } from "../helpers/dashboard/userDashboardData";
import { searchStringMap } from "./IndexController";
import { globalController } from "./GlobalController";
import { fetchUserSettings } from "../helpers/user/UserHelprs";
import { getOnlineUsers, getIo } from "../socket";
import { bindSocketToUser } from "../socket";
import type { Socket } from "socket.io";
import type { RowDataPacket } from "mysql2";
class AuthenticateController {
  async login(req: Request, res: Response) {
    const { userEmail, userPassword } = req.body;

    let connection: mysql.Connection | null = null;
    try {
      // Fail fast if DB is unreachable
      connection = await mysql.createConnection({
        ...keys.database,
        connectTimeout: 5000,
      });

      const [rows] = await connection.execute(
        {
          sql: `SELECT ${UserSqlObject},roles,entities FROM Users WHERE userEmail = ? AND userPassword = ?`,
          timeout: 15000,
        },
        [userEmail, userPassword]
      );

      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));

      if (user.length > 0) {
        const userId = user[0].userId;
        const resolveEntityId = (): number | null => {
          const raw = req.body?.entityId;
          if (raw !== undefined && raw !== null) {
            const parsed = Number(raw);
            if (!Number.isNaN(parsed)) {
              return parsed;
            }
          }
          const entitiesRaw = user[0]?.entities;
          if (typeof entitiesRaw === "string" && entitiesRaw.trim().length > 0) {
            const candidate = entitiesRaw
              .split(",")
              .map((value) => Number(value.trim()))
              .find((value) => Number.isInteger(value) && value > 0);
            if (candidate !== undefined) {
              return candidate;
            }
          }
          return null;
        };

        const entityId = resolveEntityId();
        const dashboardData = await buildUserDashboardData(
          connection,
          userId,
          entityId
        );
        const {
          notes,
          dashboardCounts,
          pendingTaskIds,
          recentTaskIds,
          oldestTaskIds,
          pendingApplicationTasks,
          pendingAssignedTasks,
          tasks,
        } = dashboardData;
        const accessToken = jwt.sign(
          { userId: user[0].userId },
          generateJWTSecretKey(100),
          { expiresIn: "7d" }
        );
        const refreshToken = jwt.sign(
          { userId: user[0].userId },
          generateJWTSecretKey(100),
          { expiresIn: "7d" }
        );

        const navigations = await getNavigations(user[0].userType);
        const userSettings = await fetchUserSettings(
          connection,
          user[0].userId
        );

        // Fetch user profile(s) with setting names by userId
        const userProfile = await getUserProfilesWithSettingNames(
          connection,
          userId
        );

        // Set auth cookies to help Socket.IO identify the user on next connect
        try {
          const secure = false; //process.env.NODE_ENV === "production";
          // Keep access token short-lived in a cookie if needed; currently 7d
          res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "lax",
            secure,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
          res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "lax",
            secure,
            maxAge: 7 * 24 * 60 * 60 * 1000,
          });
        } catch {}

        // Optionally bind an existing Socket.IO connection to this user
        try {
          const socketId = req.body?.socketId;
          if (socketId) {
            // Persist the socketId on the user for later direct emits
            try {
              await connection?.execute(
                `UPDATE Users SET socketId = ? WHERE userId = ?`,
                [String(socketId), userId]
              );
            } catch {}
            const io = getIo();
            const sock: Socket | undefined = io?.sockets.sockets.get(
              String(socketId)
            );
            if (sock) {
              bindSocketToUser(sock, userId);
              (sock as any).data = (sock as any).data || {};
              (sock as any).data.userId = userId;
              console.log(
                `Socket bound during login: socketId=${socketId}, userId=${userId}`
              );
            } else {
              console.log(`Socket not found during login bind: ${socketId}`);
            }
          }
        } catch {}

        res.json({
          success: true,
          message: "Login successful",
          user: user,
          accessToken,
          refreshToken,
          navigations,
          notes,
          userSettings,
          userProfile,
          dashboardCounts,
          pendingTaskIds,
          recentTaskIds,
          oldestTaskIds,
          pendingApplicationTasks,
          pendingAssignedTasks,
          pendingTasks: pendingAssignedTasks,
          tasks,
          dashboard: dashboardData,
        });
        // track session after responding (non-blocking)
        try {
          SessionManager.addSession(accessToken);
        } catch {}
        // Debug: Log online users snapshot right after login (post-bind)
        try {
          console.log("Online users after login:", getOnlineUsers());
        } catch {}
      } else {
        res
          .status(401)
          .json({ success: false, message: "Invalid credentials" });
      }
    } catch (error) {
      console.log("/api/login error", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error,
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async loginWithAccessToken(req: Request, res: Response) {
    const response = await SessionManager.checkAccessToken(
      req.body.accessToken
    );
    if (response == 1) {
      // Optionally bind an existing Socket.IO connection using provided socketId
      try {
        const { socketId, accessToken } = req.body || {};
        // Also persist socketId on Users if we can decode the user
        const io = getIo();
        const sock: Socket | undefined = io?.sockets.sockets.get(
          String(socketId)
        );
        if (sock && accessToken) {
          try {
            const decoded: any = jwt.decode(String(accessToken));
            const uid = decoded?.userId || decoded?.sub;
            if (uid) {
              try {
                const conn = await mysql.createConnection(keys.database);
                await conn.execute(
                  `UPDATE Users SET socketId = ? WHERE userId = ?`,
                  [String(socketId), uid]
                );
                await conn.end();
              } catch {}
              bindSocketToUser(sock, uid);
              (sock as any).data = (sock as any).data || {};
              (sock as any).data.userId = uid;
              console.log(
                `Socket bound during token-check: socketId=${socketId}, userId=${uid}`
              );
            }
          } catch {}
        }
      } catch {}

      res.json({
        success: true,
        message: "Valid Token",
      });
      try {
        console.log("Online users after token-check:", getOnlineUsers());
      } catch {}
    } else {
      res.json({
        success: false,
        message: "Invalid Token",
      });
      try {
        console.log(
          "Online users after token-check (invalid):",
          getOnlineUsers()
        );
      } catch {}
    }
  }
  //Deprecated Function
  async getAllUsers(req: Request, res: Response) {
    const { userType, entityId } = req.params;

    let sqlQuery;
    let queryParams = [];

    // Construct the query based on entities value
    if (entityId === "-1") {
      sqlQuery = `SELECT ${UserSqlObject}, userPassword, roles, entities FROM Users AS U WHERE userType = 2`;
      queryParams = [userType];
    }

    if (!sqlQuery) {
      res.status(400).json({
        success: false,
        message: "Invalid request parameters",
      });
      return;
    }

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [rows] = await connection.execute(sqlQuery, queryParams);
      res.json({
        success: true,
        message: "Success",
        data: rows,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async register(req: Request, res: Response) {
    const { userId, ...userProps } = req.body; // Destructure request body
    const { entityId } = req.params; // Extract entityId

    // Validate inputs
    if (!entityId) {
      return res.status(400).json({
        success: false,
        message: "Entity ID is required",
      });
    }

    const columnNames = Object.keys(userProps).join(", ");
    const placeholders = Object.keys(userProps).fill("?").join(", ");
    const values = Object.values(userProps);

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);

      // Insert user into the Users table
      const [result] = await connection.execute(
        `INSERT INTO Users (${columnNames}) VALUES (${placeholders})`,
        values
      );

      //@ts-ignore
      const lastInsertId = result.insertId;

      // Fetch the newly created user
      const [rows] = await connection.execute(
        `SELECT * FROM Users WHERE userId = ?`,
        [lastInsertId]
      );
      const user: User[] = Object.values(JSON.parse(JSON.stringify(rows)));

      if (user && user.length > 0) {
        // Fetch the roleNameId from the Structure table for the provided entityId
        const [roleRows] = await connection.execute(
          `SELECT userRoleNameId FROM Structure WHERE entityId = ?`,
          [entityId]
        );
        const role: any = Object.values(JSON.parse(JSON.stringify(roleRows)));

        if (role && role.length > 0) {
          const roleNameId = role[0]?.userRoleNameId || null;

          if (!roleNameId) {
            throw new Error("Role name ID not found for the given entity");
          }

          // Insert into SuperUserRoles
          await connection.execute(
            `INSERT INTO SuperUserRoles (userId, userRoleNameId) VALUES (?, ?)`,
            [user[0].userId, roleNameId]
          );
        } else {
          console.log("No roleNameId found for the given entityId");
        }
      }

      connection.end();

      //@ts-ignore
      if (result.affectedRows > 0) {
        // Generate tokens
        const accessToken = jwt.sign(
          { userId: user[0].userId },
          generateJWTSecretKey(100),
          { expiresIn: "15m" }
        );
        const refreshToken = jwt.sign(
          { userId: user[0].userId },
          generateJWTSecretKey(100),
          { expiresIn: "7d" }
        );

        // Send registration email
        const entry = searchStringMap["register"];
        const replaceString = [
          keys.dashboardLink,
          `${user[0].userFirstName} ${user[0].userLastName}`,
        ];
        let emailTemplate = await fs.readFile(entry.filePath, "utf8");
        entry.searchString.map((r, i) => {
          emailTemplate = emailTemplate.replace(r, `${replaceString[i]}`);
        });
        const subject = "User Registered Successfully";
        sendEmail(emailTemplate, user[0].userEmail, subject);

        res.json({
          success: true,
          message: "User registered successfully",
          user: user,
          accessToken,
          refreshToken,
          navigations: getNavigations(user[0].userType),
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to register user",
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "An error occurred during registration",
        error: error.message,
      });
    }
  }

  async forgotPasswordEmail(req: Request, res: Response) {
    const { userEmail } = req.body;
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const urlText = crypto.randomBytes(8).toString("hex");
      const now = new Date();
      const expireDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const [rows] = await connection.execute(
        `SELECT * FROM Users WHERE userEmail = ?`,
        [userEmail]
      );
      const userId = rows[0]?.userId ?? null;

      if (userId) {
        const [existingRows] = await connection.execute(
          "SELECT COUNT(*) AS count FROM UserFix WHERE userId = ?",
          [userId]
        );
        if (existingRows[0].count > 0) {
          await connection.execute(
            "UPDATE UserFix SET urlText = ?, expireDatetime = ? WHERE userId = ?",
            [urlText, expireDatetime, userId]
          );
        } else {
          await connection.execute(
            "INSERT INTO UserFix (userId, createdDatetime, expireDatetime, urlText) VALUES (?, NOW(), ?, ?)",
            [userId, expireDatetime, urlText]
          );
        }

        const entry = searchStringMap["reset"];
        const replaceString = [urlText];
        let emailTemplate = await fs.readFile(entry.filePath, "utf8");
        entry.searchString.map((r, i) => {
          emailTemplate = emailTemplate.replace(
            r,
            `${keys.appPath}session/reset-password/${replaceString[i]}`
          );
        });
        const subject = "Reset Password Request";
        sendEmail(emailTemplate, userEmail, subject);
        res.json({
          success: true,
          message: "Password reset URL generated successfully",
        });
      } else {
        res.json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async forgotPassword(req: Request, res: Response) {
    const { userId } = req.body;
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const urlText = crypto.randomBytes(8).toString("hex");
      const now = new Date();
      const expireDatetime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const [rows] = await connection.execute(
        `SELECT * FROM Users WHERE userId = ?`,
        [userId]
      );
      const id = rows[0]?.userId ?? null;
      const userEmail = rows[0]?.userEmail ?? null;
      if (id) {
        const [existingRows] = await connection.execute(
          "SELECT COUNT(*) AS count FROM UserFix WHERE userId = ?",
          [userId]
        );
        if (existingRows[0].count > 0) {
          // If the userId exists, update the record
          await connection.execute(
            "UPDATE UserFix SET urlText = ?, expireDatetime = ? WHERE userId = ?",
            [urlText, expireDatetime, userId]
          );
        } else {
          // If the userId doesn't exist, insert a new record
          await connection.execute(
            "INSERT INTO UserFix (userId, createdDatetime, expireDatetime, urlText) VALUES (?, NOW(), ?, ?)",
            [userId, expireDatetime, urlText]
          );
        }

        const entry = searchStringMap["reset"];
        const replaceString = [urlText];
        let emailTemplate = await fs.readFile(entry.filePath, "utf8");
        entry.searchString.map((r, i) => {
          emailTemplate = emailTemplate.replace(
            r,
            `${keys.appPath}session/reset-password/${replaceString[i]}`
          );
        });
        const subject = "Reset Password Request";
        sendEmail(emailTemplate, userEmail, subject);
        res.json({
          success: true,
          message: "Password reset URL generated successfully",
        });
      } else {
        res.json({
          success: false,
          message: "User not found",
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async resetPasswordFrontEnd(req: Request, res: Response) {
    const { urlText, newPassword } = req.body;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `SELECT * FROM UserFix WHERE  urlText = '${urlText}' AND expireDatetime > NOW()`
      );
      //@ts-ignore
      if (result.length === 0) {
        res.status(200).json({
          success: false,
          message: "Invalid or expired reset password URL",
        });
        return;
      }
      await connection.execute(
        "UPDATE Users SET userPassword = ? WHERE userId = ?",
        [newPassword, result[0].userId]
      );

      // Delete the record from UserFix table
      await connection.execute("DELETE FROM UserFix WHERE userId = ?", [
        result[0].userId,
      ]);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }

  async resetPassword(req: Request, res: Response) {
    const { userId, urlText, newPassword } = req.body;

    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(keys.database);
      const [result] = await connection.execute(
        `SELECT * FROM UserFix WHERE userId = ${userId} AND urlText = '${urlText}' AND expireDatetime > NOW()`
      );
      //@ts-ignore
      if (result.length === 0) {
        res.status(400).json({
          success: false,
          message: "Invalid or expired reset password URL",
        });
        return;
      }
      await connection.execute(
        "UPDATE Users SET userPassword = ? WHERE userId = ?",
        [newPassword, userId]
      );

      // Delete the record from UserFix table
      await connection.execute("DELETE FROM UserFix WHERE userId = ?", [
        userId,
      ]);

      res.json({ success: true, message: "Password reset successfully" });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    } finally {
      if (connection) {
        try {
          await connection.end();
        } catch {}
      }
    }
  }
}

export const authController: AuthenticateController =
  new AuthenticateController();

// Returns array of user's sub-profiles with their setting names
async function getUserProfilesWithSettingNames(
  connection: mysql.Connection,
  userId: number
): Promise<
  Array<{
    subProfileId: number;
    subProfileName: string | null;
    settingNames: string[];
  }>
> {
  const sql = `
    SELECT 
      uspt.subProfileId,
      spt.subProfileName,
      ust.Name AS settingName
    FROM UserSubProfileTypes uspt
    LEFT JOIN SubProfileTypes spt ON spt.subProfileId = uspt.subProfileId
    LEFT JOIN SubProfileSettings sps ON sps.subProfileId = uspt.subProfileId
    LEFT JOIN UserSettingsTypes ust ON ust.Id = sps.SettingId
    WHERE uspt.userId = ?
    ORDER BY uspt.subProfileId, ust.Name ASC
  `;
  const [rows] = await connection.execute<RowDataPacket[]>(sql, [userId]);
  const bySub: Record<
    string,
    {
      subProfileId: number;
      subProfileName: string | null;
      settingNames: Set<string>;
    }
  > = {};
  for (const r of rows as any[]) {
    const sid = Number(r.subProfileId);
    if (!Number.isFinite(sid)) continue;
    if (!bySub[sid]) {
      bySub[sid] = {
        subProfileId: sid,
        subProfileName: r.subProfileName ?? null,
        settingNames: new Set<string>(),
      };
    }
    const name = r.settingName;
    if (name && typeof name === "string") bySub[sid].settingNames.add(name);
  }
  return Object.values(bySub).map((v) => ({
    subProfileId: v.subProfileId,
    subProfileName: v.subProfileName,
    settingNames: Array.from(v.settingNames.values()),
  }));
}

export const getNavigations = async (userType: number) => {
  let adminNavigation = [
    { name: "My Tasks", path: "/dashboard/default", icon: "dashboard" },
    { name: "User Management", path: "/user/users", icon: "group_add" },
    { name: "Applications", path: "/user/documents", icon: "description" },
    //{ name: "Select Entity", path: "#", icon: "location_on" },
  ];
  let navigations = await [
    { name: "Dashboard", path: "/dashboard/default", icon: "dashboard" },

    {
      name: "Apply",
      icon: "pending",
      children: await getUserDocuments(userType),
    },
    { name: "Help", path: "/user/help", icon: "dashboard" },
  ];
  if (
    userType === UserTypes.Admin ||
    userType === UserTypes.EntityAdmin ||
    userType === UserTypes.SuperAdmin ||
    userType === UserTypes.Job ||
    userType === -1
  ) {
    return adminNavigation;
  } else {
    return navigations;
  }
};

async function getUserDocuments(userType: number) {
  try {
    const [rows] = await pool.execute(
      `SELECT dt.documentTypeId, dt.documentTypeName
       FROM UserDocumentsPermission udp
       JOIN DocumentType dt ON dt.documentTypeId = udp.documentTypeId
       WHERE udp.userType = ?`,
      [userType]
    );
    //@ts-ignore
    const docs = Array.isArray(rows) ? rows : [];
    return docs.map((d: any) => ({
      name: d.documentTypeName,
      iconText: "task_alt",
      path: `/user/document/${d.documentTypeId}`,
    }));
  } catch (error) {
    console.error("Error fetching user documents:", error);
    return [];
  }
}

export enum UserTypes {
  "Admin" = 1,
  "Default" = 2,
  "Job" = 3,
  "EntityAdmin" = 4,
  "SuperAdmin" = 5,
}
