"use strict";
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
exports.deleteAvatar = exports.uploadAvatar = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const sharp_1 = __importDefault(require("sharp"));
const keys_1 = __importDefault(require("../keys"));
const pool = promise_1.default.createPool(keys_1.default.database);
// Accepted mime types
const ACCEPTED_MIME = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/avif",
]);
// Max pixel box (downscale if larger)
const MAX_SIZE = 512;
// Target encoding
const TARGET_QUALITY = 70;
function uploadAvatar(req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = Number(req.params.userId);
            if (!Number.isFinite(userId) || userId <= 0) {
                res.status(400).json({ success: false, message: "Invalid userId" });
                return;
            }
            // multer places the file in req.file when using single('avatar')
            const file = req.file;
            if (!file || !file.buffer) {
                res
                    .status(400)
                    .json({ success: false, message: "No avatar file provided" });
                return;
            }
            if (!ACCEPTED_MIME.has(file.mimetype)) {
                res
                    .status(415)
                    .json({ success: false, message: "Unsupported image type" });
                return;
            }
            // Optimize with sharp: resize to fit, strip metadata, convert to WebP @ quality
            const optimized = yield (0, sharp_1.default)(file.buffer, { failOn: "none" })
                .rotate() // auto-orient
                .resize({
                width: MAX_SIZE,
                height: MAX_SIZE,
                fit: "inside",
                withoutEnlargement: true,
            })
                .toFormat("webp", { quality: TARGET_QUALITY })
                .toBuffer();
            // Store as data URL for easy consumption by frontend
            const dataUrl = `data:image/webp;base64,${optimized.toString("base64")}`;
            // Upsert into userDetails (1:1 with Users via PK/FK userDetailsId)
            const sql = `
      INSERT INTO userDetails (userDetailsId, avatar)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE avatar = VALUES(avatar)
    `;
            const [result] = yield pool.execute(sql, [
                userId,
                dataUrl,
            ]);
            res.status(201).json({
                success: true,
                message: "Avatar uploaded successfully",
                userId,
                // basic telemetry
                bytes: optimized.length,
                quality: TARGET_QUALITY,
                insertedId: (_a = result.insertId) !== null && _a !== void 0 ? _a : null,
            });
        }
        catch (error) {
            res
                .status(500)
                .json({ success: false, message: "Avatar upload failed", error });
        }
    });
}
exports.uploadAvatar = uploadAvatar;
function deleteAvatar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = Number(req.params.userId);
            if (!Number.isFinite(userId) || userId <= 0) {
                res.status(400).json({ success: false, message: "Invalid userId" });
                return;
            }
            // Set avatar field to NULL
            const [result] = yield pool.execute(`UPDATE userDetails SET avatar = NULL WHERE userDetailsId = ?`, [userId]);
            if (result.affectedRows === 0) {
                res
                    .status(404)
                    .json({ success: false, message: "No avatar found or user not found" });
                return;
            }
            res.status(200).json({
                success: true,
                message: "Avatar deleted successfully",
                userId,
            });
        }
        catch (error) {
            console.error("deleteAvatar error:", error);
            res
                .status(500)
                .json({
                success: false,
                message: "Error deleting avatar",
                error: error.message,
            });
        }
    });
}
exports.deleteAvatar = deleteAvatar;
//# sourceMappingURL=uploadAvatarController.js.map