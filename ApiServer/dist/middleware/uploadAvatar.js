"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadAvatarMulter = void 0;
// middleware/uploadAvatar.ts
const multer_1 = __importDefault(require("multer"));
// Limit to 5 MB (tune as needed)
exports.uploadAvatarMulter = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});
//# sourceMappingURL=uploadAvatar.js.map