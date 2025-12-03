"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildFolderStructure = exports.userIntrayController = void 0;
const mysql = __importStar(require("mysql2/promise"));
const keys_1 = __importDefault(require("../keys"));
class UserIntrayController {
    getUserIntrayDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            let connection = null;
            try {
                connection = yield mysql.createConnection(keys_1.default.database);
                const { userId } = req.params;
                // Query to retrieve details from userIntray based on userId
                const [rows] = yield connection.execute(`SELECT 
            UserIntray.uploadId, 
            UserIntray.intrayPath, 
            UserIntray.documentType, 
            UserIntray.dateTime, 
            UploadFiles.uploadName, 
            UploadFiles.fileName, 
            UploadFiles.fileType 
         FROM 
            UserIntray 
         JOIN 
            UploadFiles ON UserIntray.uploadId = UploadFiles.uploadId 
         WHERE 
            UserIntray.userID = ?`, [userId]);
                //@ts-ignore
                if (rows.length > 0) {
                    const pathDetails = buildFolderStructure(
                    //@ts-ignore
                    rows.map((row) => ({
                        uploadId: row.uploadId,
                        path: row.intrayPath,
                        documentType: row.documentType,
                        dateTime: row.dateTime,
                        uploadName: row.uploadName,
                        fileName: row.fileName,
                        fileType: row.fileType,
                    })));
                    res.json({
                        success: true,
                        data: rows,
                        pathDetails: pathDetails,
                    });
                }
                else {
                    // No records found, return [home] as pathDetails
                    res.json({
                        success: true,
                        data: [],
                        pathDetails: { home: {} },
                    });
                }
            }
            catch (error) {
                console.error(error);
                res
                    .status(500)
                    .send("An error occurred while retrieving user intray details.");
            }
            finally {
                if (connection) {
                    try {
                        yield connection.end();
                    }
                    catch (_a) { }
                }
            }
        });
    }
}
exports.userIntrayController = new UserIntrayController();
function buildFolderStructure(paths) {
    const root = {};
    paths.forEach(({ uploadId, path, documentType, dateTime, fileName, uploadName, fileType, }) => {
        const parts = path.split("/").filter(Boolean); // Split path into parts and remove empty strings
        let currentLevel = root;
        parts.forEach((part, index) => {
            // Ensure each level exists
            if (!currentLevel[part]) {
                currentLevel[part] = {}; // Initialize as an empty object if the level doesn't exist
            }
            // If it's the last part, initialize the `files` array if it doesn't exist
            if (index === parts.length - 1) {
                if (!currentLevel[part].files) {
                    currentLevel[part].files = [];
                }
                // Add file details to the `files` array at the last level
                currentLevel[part].files.push({
                    uploadId,
                    documentType,
                    dateTime,
                    path,
                    fileName,
                    uploadName,
                    fileType,
                });
            }
            // Move to the next level
            currentLevel = currentLevel[part];
        });
    });
    return root;
}
exports.buildFolderStructure = buildFolderStructure;
//# sourceMappingURL=UserIntrayController.js.map