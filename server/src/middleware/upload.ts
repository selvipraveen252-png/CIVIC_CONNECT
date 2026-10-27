import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary';

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage for local handling
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `civic-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP images are allowed.'));
  }
};

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

/**
 * Uploads file to Cloudinary if configured, otherwise returns local URL
 */
export const handleImageUpload = async (file?: Express.Multer.File): Promise<string> => {
  if (!file) return '';

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'civicconnect',
        resource_type: 'image',
      });
      // remove local temp file after cloud upload
      try {
        fs.unlinkSync(file.path);
      } catch (err) {
        // ignore
      }
      return result.secure_url;
    } catch (error) {
      console.warn('[Cloudinary] Upload failed, falling back to local storage URL:', error);
      return `/uploads/${file.filename}`;
    }
  }

  // Return local URL served by Express static
  return `/uploads/${file.filename}`;
};
