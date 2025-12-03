// controllers/User/AvatarController.ts
import { Request, Response } from "express";
import mysql, { ResultSetHeader } from "mysql2/promise";
import sharp from "sharp";
import keys from "../keys";

const pool = mysql.createPool(keys.database);

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

export async function uploadAvatar(req: Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      res.status(400).json({ success: false, message: "Invalid userId" });
      return;
    }

    // multer places the file in req.file when using single('avatar')
    const file = (req as any).file as Express.Multer.File | undefined;
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
    const optimized: Buffer = await sharp(file.buffer, { failOn: "none" })
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
    const [result] = await pool.execute<ResultSetHeader>(sql, [
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
      insertedId: (result as ResultSetHeader).insertId ?? null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Avatar upload failed", error });
  }
}

export async function deleteAvatar(req: Request, res: Response): Promise<void> {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isFinite(userId) || userId <= 0) {
      res.status(400).json({ success: false, message: "Invalid userId" });
      return;
    }

    // Set avatar field to NULL
    const [result] = await pool.execute<ResultSetHeader>(
      `UPDATE userDetails SET avatar = NULL WHERE userDetailsId = ?`,
      [userId]
    );

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
  } catch (error: any) {
    console.error("deleteAvatar error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Error deleting avatar",
        error: error.message,
      });
  }
}
