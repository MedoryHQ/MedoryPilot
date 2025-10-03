import React from "react";
import { Card, CardContent, Separator, Button } from "../ui";
import { Save, Loader2, Trash2, X, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

export interface ActionBarProps {
  mode: "create" | "edit" | "readonly";
  isSubmitting?: boolean;
  isSaveDisabled?: boolean;
  onSave?: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  variant?: "default" | "sticky";
  showHelperText?: boolean;
  className?: string;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  mode,
  isSubmitting = false,
  isSaveDisabled = false,
  onSave,
  onCancel,
  onDelete,
  saveLabel,
  cancelLabel,
  deleteLabel,
  variant = "default",
  showHelperText = true,
  className = ""
}) => {
  const { t } = useTranslation();
  const isReadOnly = mode === "readonly";
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  const defaultSaveLabel =
    saveLabel ||
    (isCreate
      ? toUpperCase(t("formActions.create"))
      : toUpperCase(t("formActions.saveChanges")));

  const defaultCancelLabel =
    cancelLabel ||
    (isReadOnly
      ? toUpperCase(t("formActions.close"))
      : toUpperCase(t("formActions.cancel")));

  const defaultDeleteLabel =
    deleteLabel || toUpperCase(t("formActions.delete"));

  const containerClasses =
    variant === "sticky"
      ? "sticky bottom-0 z-10 bg-background/95 backdrop-blur-sm border-t border-border"
      : "";

  return (
    <Card
      className={`border-border/50 shadow-sm ${containerClasses} ${className}`}
    >
      <CardContent className="space-y-4 p-6">
        {showHelperText && !isReadOnly && (
          <p className="text-muted-foreground text-sm">
            {toUpperCase(t("formActions.requiredFields"))}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {!isReadOnly && onSave && (
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || isSaveDisabled}
              onClick={onSave}
              className="w-full shadow-md transition-all hover:shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {toUpperCase(t("formActions.saving"))}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" />
                  {defaultSaveLabel}
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={onCancel}
            disabled={isSubmitting}
            className="w-full"
          >
            {isReadOnly ? (
              <Eye className="mr-2 h-5 w-5" />
            ) : (
              <X className="mr-2 h-5 w-5" />
            )}
            {defaultCancelLabel}
          </Button>

          {isEdit && onDelete && (
            <>
              <div className="relative my-2">
                <Separator />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-card text-muted-foreground px-3 text-xs font-medium uppercase">
                    {toUpperCase(t("formActions.dangerZone"))}
                  </span>
                </div>
              </div>

              <Button
                type="button"
                variant="destructive"
                size="lg"
                onClick={onDelete}
                disabled={isSubmitting}
                className="w-full"
              >
                <Trash2 className="mr-2 h-5 w-5" />
                {defaultDeleteLabel}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export interface InlineActionsProps {
  mode: "create" | "edit" | "readonly";
  isSubmitting?: boolean;
  isSaveDisabled?: boolean;
  onSave?: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  deleteLabel?: string;
  className?: string;
}

export const InlineActions: React.FC<InlineActionsProps> = ({
  mode,
  isSubmitting = false,
  isSaveDisabled = false,
  onSave,
  onCancel,
  onDelete,
  saveLabel,
  cancelLabel,
  deleteLabel,
  className = ""
}) => {
  const { t } = useTranslation();
  const isReadOnly = mode === "readonly";
  const isEdit = mode === "edit";

  const defaultSaveLabel = saveLabel || toUpperCase(t("formActions.save"));
  const defaultCancelLabel =
    cancelLabel || toUpperCase(t("formActions.cancel"));
  const defaultDeleteLabel =
    deleteLabel || toUpperCase(t("formActions.delete"));

  return (
    <div className={`flex items-center justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3">
        {!isReadOnly && onSave && (
          <Button
            type="submit"
            disabled={isSubmitting || isSaveDisabled}
            onClick={onSave}
            className="shadow-md transition-all hover:shadow-lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {toUpperCase(t("formActions.saving"))}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {defaultSaveLabel}
              </>
            )}
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          <X className="mr-2 h-4 w-4" />
          {defaultCancelLabel}
        </Button>
      </div>

      {isEdit && onDelete && (
        <Button
          type="button"
          variant="destructive"
          onClick={onDelete}
          disabled={isSubmitting}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {defaultDeleteLabel}
        </Button>
      )}
    </div>
  );
};
