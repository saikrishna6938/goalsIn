"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainController = void 0;
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
class MainController {
    constructor() {
        this.getUser = async (req, res) => {
            try {
                const { userId: rawUserId } = req.body || {};
                const userId = toNumber(rawUserId);
                if (userId === null) {
                    return res.status(400).json({ success: false, message: "userId is required" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const user = await db.collection("Users").findOne({ userId }, { projection: { _id: 0 } });
                if (!user) {
                    return res.status(404).json({ success: false, message: "User not found" });
                }
                return res.json({ success: true, data: user });
            }
            catch (error) {
                console.error("getUser error", error);
                return res.status(500).json({ success: false, message: "Internal server error" });
            }
        };
    }
}
exports.mainController = new MainController();
