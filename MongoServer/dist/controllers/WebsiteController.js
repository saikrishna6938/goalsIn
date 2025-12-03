"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteController = void 0;
const mongo_1 = require("../config/mongo");
const normalizeString = (value) => {
    if (typeof value === "string" && value.trim().length) {
        return value.trim();
    }
    return undefined;
};
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim().length) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
class WebsiteController {
    constructor() {
        this.getDocumentGroups = async (_req, res) => {
            try {
                const db = await (0, mongo_1.getMongoDb)();
                const [groups, types] = await Promise.all([
                    db.collection("DocumentGroup").find({}, { projection: { _id: 0 } }).toArray(),
                    db.collection("DocumentGroupType").find({}, { projection: { _id: 0 } }).toArray(),
                ]);
                const typeMap = new Map(types.map((type) => [type.groupTypeId, type]));
                const data = groups.map((group) => ({
                    ...group,
                    groupType: group.groupTypeId ? typeMap.get(group.groupTypeId) ?? null : null,
                }));
                return res.json({ success: true, data });
            }
            catch (error) {
                console.error("getDocumentGroups error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
        this.searchDetails = async (req, res) => {
            try {
                const { documentTypeId, search } = req.body || {};
                const numericDocTypeId = toNumber(documentTypeId);
                if (numericDocTypeId === null) {
                    return res.status(400).json({ success: false, message: "documentTypeId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const documentType = await db
                    .collection("DocumentType")
                    .findOne({ documentTypeId: numericDocTypeId });
                if (!documentType?.documentTypeTableId) {
                    return res.status(404).json({ success: false, message: "Document type table not configured" });
                }
                const dataTable = await db
                    .collection("DataTables")
                    .findOne({ tableId: documentType.documentTypeTableId });
                const tableName = dataTable?.tableName;
                if (!tableName) {
                    return res.status(404).json({ success: false, message: "Data table not found" });
                }
                const query = {};
                if (search && typeof search === "object") {
                    Object.entries(search).forEach(([key, value]) => {
                        const normalized = normalizeString(value);
                        if (normalized !== undefined) {
                            query[key] = { $regex: normalized, $options: "i" };
                        }
                    });
                }
                const collection = db.collection(tableName);
                const items = await collection.find(query).limit(100).toArray();
                return res.json({ success: true, data: items });
            }
            catch (error) {
                console.error("searchDetails error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
}
exports.websiteController = new WebsiteController();
