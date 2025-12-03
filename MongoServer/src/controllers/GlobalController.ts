import { Request, Response } from "express";
import { getMongoDb } from "../config/mongo";
import type {
  UserDocumentsPermission,
  Users,
  RoleTypes,
  DocumentTypeAnswers,
} from "../types/jotbox";

const toNumber = (value: any): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

const parseCsvNumbers = (value: string | undefined): number[] => {
  if (!value) return [];
  return value
    .split(",")
    .map((token) => Number(token.trim()))
    .filter((num) => Number.isFinite(num));
};

class GlobalController {
  private async userDocumentsPermission() {
    const db = await getMongoDb();
    return db.collection<UserDocumentsPermission>("UserDocumentsPermission");
  }

  private async users() {
    const db = await getMongoDb();
    return db.collection<Users>("Users");
  }

  private async roleTypes() {
    const db = await getMongoDb();
    return db.collection<RoleTypes>("RoleTypes");
  }

  private async documentTypeAnswers() {
    const db = await getMongoDb();
    return db.collection<DocumentTypeAnswers>("DocumentTypeAnswers");
  }

  checkUserDocumentPermission = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.body?.documentTypeId);
      const userType = toNumber(req.body?.userType);
      if (documentTypeId === null || userType === null) {
        return res.status(400).json({ status: false, message: "documentTypeId and userType are required" });
      }
      const collection = await this.userDocumentsPermission();
      const doc = await collection.findOne({ documentTypeId, userType }, { projection: { submissions: 1 } });
      const submissions = doc?.submissions ?? 0;
      return res.json({ status: true, data: submissions > 0 ? 1 : 0 });
    } catch (error) {
      console.error("checkUserDocumentPermission error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  checkUserSubmittedDocument = async (req: Request, res: Response) => {
    try {
      const documentTypeId = toNumber(req.body?.documentTypeId);
      const userId = toNumber(req.body?.userId);
      if (documentTypeId === null || userId === null) {
        return res.status(400).json({ status: false, message: "documentTypeId and userId are required" });
      }
      const usersCollection = await this.users();
      const user = await usersCollection.findOne({ userId }, { projection: { roles: 1 } });
      const userRoles = parseCsvNumbers(user?.roles);

      const roleTypes = await this.roleTypes();
      const defaultRole = await roleTypes.findOne(
        { roleTypeName: "Default" },
        { projection: { roleTypeId: 1 } }
      );
      const defaultRoleTypeId = defaultRole?.roleTypeId;
      const hasDefaultRole = defaultRoleTypeId ? userRoles.includes(defaultRoleTypeId) : false;

      if (!hasDefaultRole) {
        return res.json({
          status: false,
          message: "User has not been assigned the Default role type.",
          userRoles,
          defaultRoleTypeId,
          hasDefaultRole,
        });
      }
      const answers = await this.documentTypeAnswers();
      const count = await answers.countDocuments({ documentTypeId, userId });
      return res.json({ status: true, data: count });
    } catch (error) {
      console.error("checkUserSubmittedDocument error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };

  cloneProfileObject = async (req: Request, res: Response) => {
    try {
      const userId = toNumber(req.params.userId);
      if (userId === null) {
        return res.status(400).json({ status: false, message: "Invalid userId" });
      }
      const answers = await this.documentTypeAnswers();
      const doc = await answers
        .find({ userId }, { projection: { _id: 0 } })
        .sort({ createdDate: 1 })
        .limit(1)
        .next();
      return res.json({ status: true, data: doc ?? null });
    } catch (error) {
      console.error("cloneProfileObject error", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
}

export const globalController = new GlobalController();
