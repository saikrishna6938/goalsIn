import { Request, Response } from "express";
import * as mysql from "mysql2/promise";
import keys from "../keys";
import {
  buildUserWhere,
  createUserQuery,
  updateUserQuery,
} from "../modules/User";
import { generateJWTSecretKey, signJWT } from "../utils/jwt.utils";
import * as jwt from "jsonwebtoken";
import SessionManager, { ValidSession } from "../session/SessionManager";
import { globalController } from "./GlobalController";
import { getUserEntities } from "../helpers/RolesManager/AdminManager/UserManager/UserRolesManagerHelper";
import { getUserNotes } from "../helpers/notes/TaskNotes";
import { buildUserDashboardData } from "../helpers/dashboard/userDashboardData";
class MainController {
  protected(req: Request, res: Response) {
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, generateJWTSecretKey(100));
        // Token is valid, return protected data
        res.json({ success: true, message: "Protected data", user: decoded });
      } catch (error) {
        console.error("Error occurred during token verification:", error);
        res.status(401).json({ success: false, message: "Invalid token" });
      }
    }
  }

  refreshToken(req: Request, res: Response) {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token not provided" });
    }
    try {
      jwt.verify(refreshToken, keys.refreshSecret, (err, decoded) => {
        if (err) {
          console.error("Error occurred during token verification:", err);
          return res
            .status(401)
            .json({ success: false, message: "Invalid refresh token" });
        }

        //@ts-ignore
        const accessToken = jwt.sign(
          //@ts-ignore
          { userId: decoded.userId },
          generateJWTSecretKey(100),
          { expiresIn: "15m" }
        );

        // Return success response with new access token
        res.json({ success: true, message: "Token refreshed", accessToken });
      });
    } catch (error) {}
  }

  async logout(req: Request, res: Response) {
    const { accessToken } = req.body;
    const sessions = SessionManager.getAllSessions();
    const index = sessions.indexOf(String(accessToken).split(" ")[0]);
    if (index !== -1) {
      SessionManager.removeSession(sessions[index]);
      res.json({ success: true, message: "Logout successful" });
    } else {
      res.status(401).json({ success: false, message: "Invalid access token" });
    }
  }

  async getUserEntities(req: Request, res: Response): Promise<void> {
    try {
      const connection = await mysql.createConnection(keys.database);

      const { userId } = req.params;

      if (!userId) {
        res.status(400).json({
          success: false,
          message: "userId is required to fetch entities",
        });
        return;
      }

      try {
        const entities = await getUserEntities(
          connection,
          parseInt(userId, 10)
        );

        res.status(200).json({
          success: true,
          data: entities,
        });
      } finally {
        connection.end();
      }
    } catch (err) {
      console.error("Error fetching entities for user:", err);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching entities",
        error: err.message,
      });
    }
  }

  getUserSettings = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.body.userId, 10);
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId" });
      }

      const connection = await mysql.createConnection(keys.database);

      const [settings] = await connection.execute(
        `
        SELECT ust.Name,ust.Id
        FROM UserSettingsTypes ust
        INNER JOIN SubProfileSettings sps ON ust.Id = sps.SettingId
        INNER JOIN UserSubProfileTypes uspt ON sps.subProfileId = uspt.subProfileId
        WHERE uspt.userId = ?
        `,
        [userId]
      );

      connection.end();

      res.json({ success: true, data: settings });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  };

  getUserDashboardData = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.body.userId, 10);
      const { entityId: rawEntityId } = req.body;
      const entityId =
        rawEntityId !== undefined && rawEntityId !== null
          ? Number(rawEntityId)
          : undefined;
      if (isNaN(userId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid userId" });
      }

      const connection = await mysql.createConnection(keys.database);

      const userQuery = `SELECT userId FROM Users WHERE userId = ? LIMIT 1`;
      const [user]: any = await connection.execute(userQuery, [userId]);

      if (user.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const dashboardData = await buildUserDashboardData(
        connection,
        userId,
        entityId
      );

      connection.end();

      return res.json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch user dashboard data",
      });
    }
  };
  async getAllRolesWithTypes(req: Request, res: Response) {
    try {
      const connection = await mysql.createConnection(keys.database);

      const [rows] = await connection.execute(
        `SELECT 
                r.roleId, r.roleTypeId, r.roleName, r.roleDescription, r.entities,
                rt.roleTypeName, rt.roleTypeDescription
             FROM Roles AS r
             INNER JOIN RoleTypes AS rt ON r.roleTypeId = rt.roleTypeId`
      );

      connection.end();

      res.json({
        success: true,
        message: "Fetched roles successfully",
        data: rows,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async updateUser(req: Request, res: Response) {
    const { userId } = req.body;
    try {
      const connection = await mysql.createConnection(keys.database);
      let query = `UPDATE Users SET `;
      const { query: newQuery, values } = createUserQuery(
        `UPDATE Users SET `,
        req.body
      );
      values.push(req.body.userId); // add userId to the end since it's used in the WHERE clause
      const finalQuery = newQuery + ` WHERE userId=?`;

      // Now you can execute using the finalQuery and values array.
      const [result] = await connection.execute(finalQuery, values);
      if (req.body.userType === 2) {
        globalController.assignDefaultRoleToUser(req.body.userId);
      }
      connection.end();
      //@ts-ignore
      if (result.length === 0) {
        res.status(404).json({ success: false, message: "User not found" });
      } else {
        res.json({
          success: true,
          message: "User details updated successfully",
        });
      }
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async deleteUser(req: Request, res: Response) {
    const { userId } = req.body;

    try {
      const connection = await mysql.createConnection(keys.database);

      // Delete the user
      const [result] = await connection.execute(
        "DELETE FROM Users WHERE userId = ?",
        [userId]
      );

      connection.end();
      //@ts-ignore
      if (result.length === 0) {
        res.status(404).json({ success: false, message: "User not found" });
      } else {
        res.json({ success: true, message: "User deleted successfully" });
      }
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      const connection = await mysql.createConnection(keys.database);

      // Explicit allowlist (no userPassword). Includes details if present.
      const base = `
      SELECT
        u.userId,
        u.userName,
        u.userEmail,
        u.userFirstName,
        u.userLastName,
        u.userImage,
        u.userAddress,
        u.userServerEmail,
        u.userPhoneOne,
        u.userPhoneTwo,
        u.userLastLogin,
        u.userCreated,
        u.userEnabled,
        u.userLocked,
        u.userType,
        u.lastNotesSeen,
        ud.avatar,
        ud.preferences
      FROM Users u
      LEFT JOIN userDetails ud ON u.userId = ud.userDetailsId
      WHERE
    `;

      // Whitelist the fields you want to allow for filtering
      const allowedFilters = [
        "userId",
        "userEmail",
        "userName",
        "mobileNumber",
        "status",
      ];

      const { query, values } = buildUserWhere(base, req.body, allowedFilters);

      const [rows] = await connection.execute(query, values);
      await connection.end();

      // @ts-ignore
      if (!rows || rows.length === 0) {
        res.status(404).json({ success: false, message: "User not found" });
        return;
      }

      // Defensive scrub in case schema changes accidentally reintroduce userPassword
      // @ts-ignore
      const sanitized = rows.map((r: any) => {
        if ("userPassword" in r) delete r.userPassword;
        return r;
      });

      res.json({ success: true, data: sanitized });
    } catch (error) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error", error });
    }
  }
}

export const mainController: MainController = new MainController();
