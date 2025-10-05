import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Badge, Input, Label } from "../ui";
import { ImageIcon, Upload, X, Loader2, AlertCircle, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import axios from "@/api/axios";
import { ADMIN_API_PATH, getFileUrl } from "@/utils";

export interface MediaUploaderProps {
  value?: { name: string; path: string; size: number } | null;
  onChange: (
    value: { name: string; path: string; size: number } | null
  ) => void;
  onAltTextChange?: (alt: string) => void;
  altText?: string;
  label?: string;
  description?: string;
  maxSizeMB?: number;
  acceptedFormats?: string[];
  previewHeight?: string;
  showAltInput?: boolean;
  cropAspectRatio?: number;
  disabled?: boolean;
  className?: string;
  multi?: boolean;
  imageLimit?: number;
  images?: { name: string; path: string; size: number }[];
  setUploadedImages?: (
    images: { name: string; path: string; size: number }[]
  ) => void;
}

type UploadState = "empty" | "hover" | "uploading" | "error" | "preview";
type UploadedImage = { name: string; path: string; size: number };

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  value,
  onChange,
  onAltTextChange,
  altText = "",
  label,
  description,
  maxSizeMB = 5,
  acceptedFormats = ["PNG", "JPG", "SVG", "WEBP"],
  previewHeight = "h-64",
  showAltInput = true,
  cropAspectRatio,
  disabled = false,
  className = "",
  multi = false,
  imageLimit = 10,
  images = [],
  setUploadedImages
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiInputRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<UploadState>(
    value ? "preview" : "empty"
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileList, setFileList] = useState<UploadedImage[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  useEffect(() => {
    if (images && images.length && !fileList.length) {
      setFileList(images);
    }
  }, [images]);

  const uploadFileToBackend = async (
    file: File
  ): Promise<UploadedImage | null> => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      setError(toUpperCase(t("mediaUploader.maxSize", { maxSize: maxSizeMB })));
      setUploadState("error");
      return null;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      setUploadState("uploading");
      const res = await axios.post(
        `${ADMIN_API_PATH}/upload/single`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      );
      const data = res.data.data;
      setUploadState("preview");
      return { name: data.filename, path: data.path, size: data.size };
    } catch (err) {
      setError(toUpperCase(t("mediaUploader.uploadError")));
      setUploadState("error");
      return null;
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(toUpperCase(t("mediaUploader.invalidType")));
      setUploadState("error");
      return;
    }
    const uploaded = await uploadFileToBackend(file);
    if (uploaded) {
      onChange(uploaded);
    }
  };

  const handleMultiInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + fileList.length > imageLimit) {
      setError(
        toUpperCase(t("mediaUploader.limitWarning", { limit: imageLimit }))
      );
      return;
    }
    const uploadedImages: UploadedImage[] = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const uploaded = await uploadFileToBackend(file);
      if (uploaded) uploadedImages.push(uploaded);
    }
    const newList = [...fileList, ...uploadedImages].slice(0, imageLimit);
    setFileList(newList);
    setUploadedImages?.(newList);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
      setUploadState("hover");
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadState(value ? "preview" : "empty");
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!disabled) {
      const files = Array.from(e.dataTransfer.files || []);
      if (multi) {
        if (files.length + fileList.length > imageLimit) {
          setError(
            toUpperCase(t("mediaUploader.limitWarning", { limit: imageLimit }))
          );
          return;
        }
        const uploadedImages: UploadedImage[] = [];
        for (const file of files) {
          if (!file.type.startsWith("image/")) continue;
          const uploaded = await uploadFileToBackend(file);
          if (uploaded) uploadedImages.push(uploaded);
        }
        const newList = [...fileList, ...uploadedImages].slice(0, imageLimit);
        setFileList(newList);
        setUploadedImages?.(newList);
      } else {
        const file = files[0];
        if (file && file.type.startsWith("image/")) {
          const uploaded = await uploadFileToBackend(file);
          if (uploaded) onChange(uploaded);
        }
      }
    }
  };

  const removeImage = () => {
    onChange(null);
    if (onAltTextChange) onAltTextChange("");
    setUploadState("empty");
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMultiImage = (idx: number) => {
    const newList = fileList.filter((_, i) => i !== idx);
    setFileList(newList);
    setUploadedImages?.(newList);
  };

  const replaceImage = () => {
    fileInputRef.current?.click();
  };

  const handlePreview = (imgPath: string) => {
    setPreviewImage(imgPath);
    setPreviewOpen(true);
  };

  const uploadButton = (!multi && (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => fileInputRef.current?.click()}
      disabled={disabled}
      className="shadow-lg"
    >
      <Plus className="mr-2 h-4 w-4" />
      {toUpperCase(t("mediaUploader.upload"))}
    </Button>
  )) || (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => multiInputRef.current?.click()}
      disabled={disabled || fileList.length >= imageLimit}
      className="shadow-lg"
    >
      <Plus className="mr-2 h-4 w-4" />
      {toUpperCase(t("mediaUploader.upload"))}
    </Button>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {!multi && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            disabled={disabled}
            className="hidden"
            aria-label={toUpperCase(t("mediaUploader.uploadImageFile"))}
          />
          <div className="relative">
            <AnimatePresence mode="wait">
              {uploadState === "preview" && value ? (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative"
                >
                  <div
                    className={`border-border bg-muted/10 overflow-hidden rounded-xl border-2 ${previewHeight}`}
                  >
                    <img
                      src={getFileUrl(value.path)}
                      alt={altText || toUpperCase(t("mediaUploader.preview"))}
                      className="h-full w-full object-contain"
                    />
                    {cropAspectRatio && (
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5">
                        <div
                          className="border-2 border-dashed border-white/50"
                          style={{
                            width: "80%",
                            aspectRatio: cropAspectRatio
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={replaceImage}
                      disabled={disabled}
                      className="shadow-lg"
                    >
                      {toUpperCase(t("mediaUploader.replace"))}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={removeImage}
                      disabled={disabled}
                      className="shadow-lg"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ) : uploadState === "uploading" ? (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`border-primary bg-primary/5 flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 ${previewHeight}`}
                >
                  <Loader2 className="text-primary h-12 w-12 animate-spin" />
                  <p className="text-muted-foreground text-sm">
                    {toUpperCase(t("mediaUploader.uploading"))}
                  </p>
                </motion.div>
              ) : uploadState === "error" ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                  className={`border-destructive bg-destructive/5 hover:bg-destructive/10 flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-colors ${previewHeight}`}
                >
                  <AlertCircle className="text-destructive h-12 w-12" />
                  <p className="text-destructive text-sm font-medium">
                    {error}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {toUpperCase(t("mediaUploader.tryAgain"))}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !disabled && fileInputRef.current?.click()}
                  className={`flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-8 transition-all ${
                    disabled
                      ? "bg-muted/10 cursor-not-allowed opacity-50"
                      : "hover:border-primary hover:bg-primary/5"
                  } ${isDragging ? "border-primary bg-primary/10 scale-105" : "border-border"} ${previewHeight} `}
                >
                  <div className="bg-primary/10 flex h-16 w-16 items-center justify-center rounded-full">
                    {isDragging ? (
                      <Upload className="text-primary h-8 w-8 animate-bounce" />
                    ) : (
                      <ImageIcon className="text-primary h-8 w-8" />
                    )}
                  </div>
                  <div className="text-center">
                    <p className="text-foreground mb-1 font-medium">
                      {toUpperCase(label || t("mediaUploader.uploadImage"))}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {toUpperCase(
                        description || t("mediaUploader.dropOrBrowse")
                      )}
                    </p>
                  </div>
                  <Badge variant="secondary" className="mt-2">
                    {acceptedFormats.join(", ")} •{" "}
                    {toUpperCase(t("mediaUploader.max"))} {maxSizeMB}MB
                  </Badge>
                  {uploadButton}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}

      {multi && (
        <>
          <input
            ref={multiInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMultiInput}
            disabled={disabled || fileList.length >= imageLimit}
            className="hidden"
            aria-label={toUpperCase(t("mediaUploader.uploadImageFile"))}
          />
          <div
            className={`flex flex-wrap gap-4 ${previewHeight}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {fileList.map((img, idx) => (
              <div
                key={idx}
                className="border-border group relative overflow-hidden rounded-xl border"
                style={{ width: "120px", height: "120px" }}
              >
                <img
                  src={getFileUrl(img.path)}
                  alt={img.name}
                  className="h-full w-full object-cover"
                  onClick={() => handlePreview(img.path)}
                  style={{ cursor: "pointer" }}
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeMultiImage(idx)}
                  className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {fileList.length < imageLimit && uploadButton}
          </div>
          {previewOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
              onClick={() => setPreviewOpen(false)}
            >
              <img
                src={getFileUrl(previewImage)}
                alt={toUpperCase(t("mediaUploader.preview"))}
                className="max-h-full max-w-full rounded-xl shadow-lg"
              />
            </div>
          )}
        </>
      )}

      {showAltInput && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <Label htmlFor="alt-text" className="text-sm font-medium">
            {toUpperCase(t("mediaUploader.altText"))}
          </Label>
          <Input
            id="alt-text"
            type="text"
            placeholder={toUpperCase(t("mediaUploader.altTextPlaceholder"))}
            value={altText}
            onChange={(e) => onAltTextChange?.(e.target.value)}
            disabled={disabled || (!value && !multi)}
            className="h-11"
          />
          <p className="text-muted-foreground text-xs">
            {toUpperCase(t("mediaUploader.altTextDescription"))}
          </p>
        </motion.div>
      )}
    </div>
  );
};
