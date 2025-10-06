import multer from "multer";
import { Request, Response, NextFunction } from "express";
import fs from "fs";
import {
  logAdminError as logCatchyError,
  logAdminInfo as logInfo,
  logAdminWarn as logWarn,
  getResponseMessage,
  sendError,
} from "@/utils";
import path from "path";

const getUploadsFolder = (req: Request) => {
  const folder = req.query.folder || "";
  const uploadPath = path.join("uploads", folder as string);

  try {
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  } catch {
    throw new Error("Failed to create upload directory");
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({ storage: storage });

  return upload;
};

export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logInfo("Image upload attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "image_upload_attempt",
    });

    const upload = getUploadsFolder(req);

    upload.single("file")(req, res, (err) => {
      if (err) {
        logWarn("Image upload failed", {
          ip: (req as any).hashedIp,
          id: (req as any).userId,
          path: req.path,
          event: "image_upload_failed",
          error: err.message,
        });
        return sendError(req, res, 500, "invalidImage");
      }

      logInfo("Image uploaded successfully", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "image_uploaded",
      });

      res.status(200).json({
        message: getResponseMessage("imageUploaded"),
        file: req.file,
      });
    });
  } catch (err) {
    logCatchyError("upload_image_exception", err, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_upload_image_exception",
    });
    next(err);
  }
};

export const uploadImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logInfo("Images upload attempt", {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      path: req.path,
      event: "images_upload_attempt",
    });

    const upload = getUploadsFolder(req);

    upload.array("files")(req, res, (err) => {
      if (err) {
        logWarn("Images upload failed", {
          ip: (req as any).hashedIp,
          id: (req as any).userId,
          path: req.path,
          event: "images_upload_failed",
          error: err.message,
        });
        return sendError(req, res, 500, "invalidImage");
      }

      logInfo("Images uploaded successfully", {
        ip: (req as any).hashedIp,
        id: (req as any).userId,
        path: req.path,
        event: "images_uploaded",
      });

      res.status(200).json({
        message: getResponseMessage("imageUploaded"),
        files: req.files,
      });
    });
  } catch (err) {
    logCatchyError("upload_images_exception", err, {
      ip: (req as any).hashedIp,
      id: (req as any).userId,
      event: "admin_upload_images_exception",
    });
    next(err);
  }
};
