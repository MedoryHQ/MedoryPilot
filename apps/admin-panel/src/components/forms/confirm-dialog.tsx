import React from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "../ui";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  variant = "default",
  isLoading = false
}) => {
  const { t } = useTranslation();

  const defaultTitle =
    title ||
    (variant === "destructive"
      ? toUpperCase(t("confirmDialog.areYouSure"))
      : toUpperCase(t("confirmDialog.confirmAction")));

  const defaultDescription =
    description ||
    (variant === "destructive"
      ? toUpperCase(t("confirmDialog.deleteDescription"))
      : toUpperCase(t("confirmDialog.confirmDescription")));

  const defaultConfirmLabel =
    confirmLabel ||
    (variant === "destructive"
      ? toUpperCase(t("confirmDialog.delete"))
      : toUpperCase(t("confirmDialog.confirm")));

  const defaultCancelLabel =
    cancelLabel || toUpperCase(t("confirmDialog.cancel"));

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {variant === "destructive" && (
              <AlertCircle className="text-destructive h-5 w-5 flex-shrink-0" />
            )}
            {defaultTitle}
          </AlertDialogTitle>
          <AlertDialogDescription>{defaultDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {defaultCancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={
              variant === "destructive"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : ""
            }
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {defaultConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  itemName?: string;
  itemType?: string;
  isLoading?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  itemName,
  itemType = "item",
  isLoading = false
}) => {
  const { t } = useTranslation();

  const title = itemType
    ? toUpperCase(t("confirmDialog.deleteTitle", { itemType }))
    : toUpperCase(t("confirmDialog.delete"));

  const description = itemName
    ? toUpperCase(t("confirmDialog.deleteItemDescription", { itemName }))
    : toUpperCase(t("confirmDialog.deleteDescription"));

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title={title}
      description={description}
      variant="destructive"
      isLoading={isLoading}
    />
  );
};
