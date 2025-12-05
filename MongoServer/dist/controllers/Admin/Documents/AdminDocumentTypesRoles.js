"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminDocumentTypesRolesController = void 0;
const mongo_1 = require("../../../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const nextId = async (collection) => {
    const doc = await collection
        .find({}, { projection: { documentTypeRoleId: 1 } })
        .sort({ documentTypeRoleId: -1 })
        .limit(1)
        .next();
    return (doc?.documentTypeRoleId ?? 0) + 1;
};
class AdminDocumentTypesRolesController {
    constructor() {
        this.getDocumentTypeRoles = async (req, res) => {
            try {
                const documentTypeId = toNumber(req.params?.documentTypeId);
                if (documentTypeId === null) {
                    return res.status(400).json({ message: "documentTypeId is required", status: false });
                }
                const roles = await this.rolesCollection();
                const docs = await roles.find({ documentTypeId }, { projection: { _id: 0 } }).toArray();
                const roleNames = await this.roleNamesCollection();
                const names = await roleNames
                    .find({}, { projection: { roleNameId: 1, roleName: 1, _id: 0 } })
                    .toArray();
                const rows = docs.map((doc) => ({
                    ...doc,
                    roleName: names.find((name) => name.roleNameId === doc.roleNameId)?.roleName,
                }));
                return res.status(200).json({ rows, status: true });
            }
            catch (error) {
                console.error("getDocumentTypeRoles error", error);
                return res.status(500).json({ message: "Error fetching DocumentTypeRoles", error, status: false });
            }
        };
        this.addDocumentTypeRoles = async (req, res) => {
            try {
                const roles = Array.isArray(req.body) ? req.body : [];
                if (!roles.length) {
                    return res.status(400).json({ message: "Invalid input: must be a non-empty array", status: false });
                }
                const collection = await this.rolesCollection();
                const docs = [];
                for (const role of roles) {
                    const documentTypeId = toNumber(role.documentTypeId);
                    const roleNameId = toNumber(role.roleNameId);
                    if (documentTypeId === null || roleNameId === null)
                        continue;
                    docs.push({
                        documentTypeRoleId: await nextId(collection),
                        documentTypeId,
                        documentSecurity: typeof role.documentSecurity === "string" ? role.documentSecurity : "1",
                        roleNameId,
                    });
                }
                if (!docs.length) {
                    return res.status(400).json({ message: "No valid roles provided", status: false });
                }
                await collection.insertMany(docs);
                return res.status(201).json({
                    message: "Roles added successfully",
                    affectedRows: docs.length,
                    status: true,
                });
            }
            catch (error) {
                console.error("addDocumentTypeRoles error", error);
                return res.status(500).json({ message: "Error adding roles", error, status: false });
            }
        };
        this.deleteDocumentTypeRoles = async (req, res) => {
            try {
                const roleIds = Array.isArray(req.body?.roleIds)
                    ? req.body.roleIds.map((val) => Number(val)).filter(Number.isFinite)
                    : [];
                const documentTypeId = toNumber(req.body?.documentTypeId);
                if (!roleIds.length || documentTypeId === null) {
                    return res
                        .status(400)
                        .json({ message: "Invalid input: Provide roleIds and documentTypeId", status: false });
                }
                const collection = await this.rolesCollection();
                const result = await collection.deleteMany({
                    roleNameId: { $in: roleIds },
                    documentTypeId,
                });
                return res.status(200).json({
                    message: "Roles deleted successfully",
                    affectedRows: result.deletedCount ?? 0,
                    status: true,
                });
            }
            catch (error) {
                console.error("deleteDocumentTypeRoles error", error);
                return res.status(500).json({ message: "Error deleting roles", error, status: false });
            }
        };
    }
    async rolesCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperDocumentTypeRoles");
    }
    async roleNamesCollection() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("SuperRoleNames");
    }
}
exports.AdminDocumentTypesRolesController = AdminDocumentTypesRolesController;
