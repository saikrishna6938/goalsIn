// middleware/uploadAvatar.ts
import multer from "multer";

// Limit to 5 MB (tune as needed)
export const uploadAvatarMulter = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});
