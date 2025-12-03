import crypto from "crypto";
import { Request, Response } from "express";
import { Collection } from "mongodb";
import { getMongoDb } from "../config/mongo";
import { signToken, verifyToken } from "../utils/jwt";
import type { Users, UserFix, Structure, SuperUserRoles } from "../types/jotbox";

const success = (res: Response, data: unknown) => res.json({ success: true, ...((typeof data === "object" && data !== null) ? data as object : { data }) });
const failure = (res: Response, status: number, message: string) => res.status(status).json({ success: false, message });

const parseEntityFilter = (entities: string | undefined, entityId: number): boolean => {
  if (!entities) return false;
  const parts = entities.split(",").map((part) => Number(part.trim())).filter(Number.isFinite);
  return parts.includes(entityId);
};

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const toBoolean = (value: any, fallback: boolean): boolean => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes"].includes(normalized)) return true;
    if (["false", "0", "no"].includes(normalized)) return false;
  }
  return fallback;
};

const normalizeString = (value: any): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : undefined;
  }
  return undefined;
};

const parseDate = (value: any): Date | undefined => {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }
  return undefined;
};

const RESET_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

class AuthenticateController {
  private async users(): Promise<Collection<Users>> {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async fixes(): Promise<Collection<UserFix>> {
    const db = await getMongoDb();
    return db.collection<UserFix>("UserFix");
  }

  private async structures(): Promise<Collection<Structure>> {
    const db = await getMongoDb();
    return db.collection<Structure>("Structure");
  }

  private async superUserRoles(): Promise<Collection<SuperUserRoles>> {
    const db = await getMongoDb();
    return db.collection<SuperUserRoles>("SuperUserRoles");
  }

  private async nextUserId(): Promise<number> {
    const collection = await this.users();
    const doc = await collection.find().project({ userId: 1 }).sort({ userId: -1 }).limit(1).next();
    return (doc?.userId ?? 0) + 1;
  }

  login = async (req: Request, res: Response) => {
    try {
      const { userEmail, userPassword } = req.body || {};
      if (!userEmail || !userPassword) {
        return failure(res, 400, "userEmail and userPassword are required");
      }
      const collection = await this.users();
      const user = await collection.findOne({ userEmail, userPassword }, { projection: { _id: 0 } });
      if (!user) {
        return failure(res, 401, "Invalid credentials");
      }
      if (!user.userId) {
        return failure(res, 500, "User record missing identifier");
      }
      const payload = { userId: user.userId };
      const accessToken = signToken(payload, "1h");
      const refreshToken = signToken(payload, "7d");
      return res.json({ success: true, message: "Login successful", user, accessToken, refreshToken });
    } catch (error) {
      console.error("login error", error);
      return failure(res, 500, "Internal server error");
    }
  };

  loginWithAccessToken = (req: Request, res: Response) => {
    try {
      const { accessToken } = req.body || {};
      if (!accessToken) {
        return failure(res, 400, "accessToken is required");
      }
      verifyToken(accessToken);
      return success(res, { message: "Valid Token" });
    } catch {
      return failure(res, 401, "Invalid Token");
    }
  };

  getAllUsers = async (req: Request, res: Response) => {
    try {
      const { entityId, userType } = req.params;
      const numericEntityId = toNumber(entityId);
      const numericUserType = toNumber(userType);
      if (numericUserType === null || numericEntityId === null) {
        return failure(res, 400, "Invalid parameters");
      }
      const collection = await this.users();
      const cursor = collection.find({ userType: numericUserType }).project({ _id: 0 });
      const docs = await cursor.toArray();
      if (numericEntityId !== -1) {
        const filtered = docs.filter((doc) => parseEntityFilter(doc.entities, numericEntityId));
        return success(res, { data: filtered });
      }
      return success(res, { data: docs });
    } catch (error) {
      console.error("getAllUsers error", error);
      return failure(res, 500, "Internal server error");
    }
  };

  register = async (req: Request, res: Response) => {
    try {
      const numericEntityId =
        toNumber(req.params.entityId) ?? toNumber(req.body?.entityId) ?? 1;
      const incomingUser = req.body || {};
      const requiredFields = [
        "userName",
        "userEmail",
        "userPassword",
        "userFirstName",
        "userLastName",
      ] as const;
      const missing = requiredFields.filter(
        (field) => !normalizeString(incomingUser[field])
      );
      if (missing.length) {
        return failure(
          res,
          400,
          `Missing fields: ${missing.join(", ")}`
        );
      }
      const collection = await this.users();
      const userId = await this.nextUserId();
      const now = new Date();
      const doc: Users = {
        userId,
        userName: normalizeString(incomingUser.userName)!,
        userEmail: normalizeString(incomingUser.userEmail)!,
        userPassword: normalizeString(incomingUser.userPassword)!,
        userFirstName: normalizeString(incomingUser.userFirstName)!,
        userLastName: normalizeString(incomingUser.userLastName)!,
        socketId: toNumber(incomingUser.socketId) ?? 0,
        userImage: normalizeString(incomingUser.userImage),
        userAddress: normalizeString(incomingUser.userAddress),
        userServerEmail: normalizeString(incomingUser.userServerEmail),
        userPhoneOne: normalizeString(incomingUser.userPhoneOne),
        userPhoneTwo: normalizeString(incomingUser.userPhoneTwo),
        userLastLogin: parseDate(incomingUser.userLastLogin),
        userCreated: (parseDate(incomingUser.userCreated) ?? now) as any,
        userEnabled: toBoolean(incomingUser.userEnabled, true) as any,
        userLocked: toBoolean(incomingUser.userLocked, false) as any,
        userType: toNumber(incomingUser.userType) ?? 2,
        roles: normalizeString(incomingUser.roles) ?? "4",
        entities: normalizeString(incomingUser.entities) ?? "1",
        lastNotesSeen: (parseDate(incomingUser.lastNotesSeen) ?? now) as any,
      };
      Object.keys(doc).forEach((key) => {
        const value = (doc as any)[key];
        if (value === undefined || value === null) {
          delete (doc as any)[key];
        }
      });
      await collection.insertOne(doc);

      const structureCollection = await this.structures();
      const structure = await structureCollection.findOne({ entityId: numericEntityId });
      const roleNameId = structure?.userRoleNameId;
      if (roleNameId) {
        const superRoles = await this.superUserRoles();
        await superRoles.insertOne({ userId, userRoleNameId: roleNameId } as SuperUserRoles);
      }

      const payload = { userId };
      const accessToken = signToken(payload, "1h");
      const refreshToken = signToken(payload, "7d");
      return success(res, { message: "User registered successfully", user: doc, accessToken, refreshToken });
    } catch (error) {
      console.error("register error", error);
      if (error && typeof error === "object" && "errInfo" in error) {
        console.error("register error details:", JSON.stringify((error as any).errInfo, null, 2));
      }
      return failure(res, 500, "Internal server error");
    }
  };

  private async generateResetToken(userId: number) {
    const token = crypto.randomBytes(16).toString("hex");
    const expires = new Date(Date.now() + RESET_DURATION_MS);
    const collection = await this.fixes();
    await collection.updateOne(
      { userId },
      {
        $set: {
          userId,
          createdDatetime: new Date(),
          expireDatetime: expires,
          urlText: token,
        } as Partial<UserFix>,
      },
      { upsert: true }
    );
    return { token, expires };
  }

  forgotPasswordEmail = async (req: Request, res: Response) => {
    try {
      const { userEmail } = req.body || {};
      if (!userEmail) {
        return failure(res, 400, "userEmail is required");
      }
      const collection = await this.users();
      const user = await collection.findOne({ userEmail }, { projection: { userId: 1 } });
      if (!user?.userId) {
        return failure(res, 404, "User not found");
      }
      const { token, expires } = await this.generateResetToken(user.userId);
      return success(res, { message: "Password reset token generated", token, expires });
    } catch (error) {
      console.error("forgotPasswordEmail error", error);
      return failure(res, 500, "Internal server error");
    }
  };

  forgotPassword = async (req: Request, res: Response) => {
    try {
      const { userId } = req.body || {};
      const numericUserId = toNumber(userId);
      if (numericUserId === null) {
        return failure(res, 400, "userId is required");
      }
      const { token, expires } = await this.generateResetToken(numericUserId);
      return success(res, { message: "Password reset token generated", token, expires });
    } catch (error) {
      console.error("forgotPassword error", error);
      return failure(res, 500, "Internal server error");
    }
  };

  resetPasswordFrontEnd = async (req: Request, res: Response) => {
    try {
      const { urlText, newPassword } = req.body || {};
      if (!urlText || !newPassword) {
        return failure(res, 400, "urlText and newPassword are required");
      }
      const fixesCollection = await this.fixes();
      const resetDoc = await fixesCollection.findOne({ urlText, expireDatetime: { $gt: new Date() } });
      if (!resetDoc?.userId) {
        return failure(res, 400, "Invalid or expired reset password token");
      }
      const users = await this.users();
      await users.updateOne({ userId: resetDoc.userId }, { $set: { userPassword: newPassword } });
      await fixesCollection.deleteOne({ userId: resetDoc.userId });
      return success(res, { message: "Password reset successfully" });
    } catch (error) {
      console.error("resetPasswordFrontEnd error", error);
      return failure(res, 500, "Internal server error");
    }
  };

  createUser = this.register; // alias for clarity
}

export const authController = new AuthenticateController();
