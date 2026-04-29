import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";

const uploadDir = process.env.UPLOAD_DIR || "uploads";

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
  fileFilter: (_req, file, cb) => {
    // Accept all file types; validate on API layer if needed
    cb(null, true);
  },
});

export const uploadSingle = upload.single("file");
