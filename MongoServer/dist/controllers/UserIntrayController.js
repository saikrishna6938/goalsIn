"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIntrayController = void 0;
const mongo_1 = require("../config/mongo");
const buildFolderStructure = (items) => {
    const root = {};
    for (const item of items) {
        const pathStr = typeof item.path === "string" ? item.path : "";
        const parts = pathStr.split("/").filter(Boolean);
        let currentLevel = root;
        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                currentLevel[part] = {};
            }
            if (index === parts.length - 1) {
                const node = currentLevel[part];
                node.files = node.files || [];
                node.files.push(item);
            }
            else {
                currentLevel = currentLevel[part];
            }
        });
    }
    return root;
};
class UserIntrayController {
    constructor() {
        this.getUserIntrayDetails = async (req, res) => {
            try {
                const userId = Number(req.params.userId);
                if (!Number.isFinite(userId)) {
                    return res.status(400).json({ success: false, message: "Invalid userId" });
                }
                const db = await (0, mongo_1.getMongoDb)();
                const pipeline = [
                    { $match: { userID: userId } },
                    {
                        $lookup: {
                            from: "UploadFiles",
                            localField: "uploadId",
                            foreignField: "uploadId",
                            as: "upload",
                        },
                    },
                    { $unwind: { path: "$upload", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 0,
                            uploadId: 1,
                            intrayPath: 1,
                            documentType: 1,
                            dateTime: 1,
                            uploadName: "$upload.uploadName",
                            fileName: "$upload.fileName",
                            fileType: "$upload.fileType",
                        },
                    },
                ];
                const docs = await db.collection("UserIntray").aggregate(pipeline).toArray();
                const pathDetails = docs.length
                    ? buildFolderStructure(docs.map((doc) => ({
                        uploadId: doc.uploadId,
                        path: doc.intrayPath,
                        documentType: doc.documentType,
                        dateTime: doc.dateTime,
                        fileName: doc.fileName,
                        uploadName: doc.uploadName,
                        fileType: doc.fileType,
                    })))
                    : { home: {} };
                return res.json({ success: true, data: docs, pathDetails });
            }
            catch (error) {
                console.error("getUserIntrayDetails error", error);
                return res.status(500).send("An error occurred while retrieving user intray details.");
            }
        };
    }
}
exports.userIntrayController = new UserIntrayController();
