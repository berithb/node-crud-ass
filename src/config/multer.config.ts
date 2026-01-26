import multer from "multer";
import path from "path";
import fs from "fs";

// Absolute uploads directory
const uploadDir = path.join(process.cwd(), "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter - Allow only images for profile pictures and products
const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;

  const extname = allowedImageTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedImageTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (JPEG, PNG, GIF, WebP) are allowed"));
  }
};

// Multer instance - 1MB limit for images
export const upload = multer({
  storage,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB
  },
  fileFilter,
});
