"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskTagDetailController = void 0;
const mongo_1 = require("../config/mongo");
const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value))
        return value;
    if (typeof value === "string" && value.trim()) {
        const parsed = Number(value.trim());
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
};
const parseJson = (payload) => {
    if (!payload)
        return null;
    try {
        return JSON.parse(payload);
    }
    catch {
        return null;
    }
};
class TaskTagDetailsController {
    constructor() {
        this.getTaskTagDetails = async (req, res) => {
            try {
                const taskTagTableId = toNumber(req.params?.taskTagTableId);
                const taskTagId = toNumber(req.params?.taskTagId);
                if (taskTagTableId === null || taskTagId === null) {
                    return res.status(400).json({ status: false, message: "Invalid parameters" });
                }
                const [detailsCollection, tablesCollection] = await Promise.all([
                    this.taskTagDetails(),
                    this.dataTables(),
                ]);
                const details = await detailsCollection.findOne({ taskTagTableId }, { projection: { _id: 0 } });
                const tableMeta = await tablesCollection.findOne({ tableId: taskTagTableId }, { projection: { tableName: 1 } });
                if (!details || !tableMeta) {
                    return res.json({ status: true, message: "No data found", data: {} });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const tableCollection = db.collection(this.tableCollectionName(tableMeta.tableName));
                const tableData = await tableCollection.findOne({ Id: taskTagId }, { projection: { _id: 0 } });
                const payload = {
                    ...details,
                    taskTagDetailsData: parseJson(details.taskTagDetailsData),
                    tableName: tableMeta.tableName,
                    tableData: tableData ?? {},
                };
                return res.json({ status: true, message: "Success", data: payload });
            }
            catch (error) {
                console.error("getTaskTagDetails error", error);
                return res.status(500).json({ status: false, message: "An unexpected error occurred" });
            }
        };
        this.getSearchTagDetails = async (req, res) => {
            try {
                const taskTagTableId = toNumber(req.params?.taskTagTableId);
                if (taskTagTableId === null) {
                    return res.status(400).json({ status: false, message: "Invalid parameters" });
                }
                const collection = await this.taskTagDetails();
                const doc = await collection.findOne({ taskTagTableId }, { projection: { taskTagDetailsData: 1, _id: 0 } });
                if (!doc) {
                    return res.json({ status: true, message: "No data found", data: {} });
                }
                return res.json({
                    status: true,
                    message: "Success",
                    data: parseJson(doc.taskTagDetailsData) ?? {},
                });
            }
            catch (error) {
                console.error("getSearchTagDetails error", error);
                return res.status(500).json({ status: false, message: "An unexpected error occurred" });
            }
        };
    }
    async taskTagDetails() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("TaskTagDetails");
    }
    async dataTables() {
        const db = await (0, mongo_1.getMongoDb)();
        return db.collection("DataTables");
    }
    tableCollectionName(tableName) {
        return `datatable_${tableName.replace(/[^a-zA-Z0-9_]/g, "")}`;
    }
}
exports.taskTagDetailController = new TaskTagDetailsController();
