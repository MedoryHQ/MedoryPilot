import React from "react";
import { Card, CardContent, Button } from "../ui";
import { Save, Loader2, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

interface FormActionsProps {
  mode: "create" | "edit" | "readonly";
  isSubmitting?: boolean;
  onCancel: () => void;
  onDelete?: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  mode,
  isSubmitting = false,
  onCancel,
  onDelete
}) => {
  const { t } = useTranslation();
  const isReadOnly = mode === "readonly";

  return (
    <Card className="border-border/50 bg-muted/20 shadow-sm">
      <CardContent className="space-y-4 p-6">
        {!isReadOnly && (
          <p className="text-muted-foreground text-sm">
            {toUpperCase(t("formActions.requiredFields"))}
          </p>
        )}

        <div className="flex flex-col gap-3">
          {!isReadOnly && (
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
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
                  {mode === "create"
                    ? toUpperCase(t("formActions.create"))
                    : toUpperCase(t("formActions.saveChanges"))}
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
            <X className="mr-2 h-5 w-5" />
            {isReadOnly
              ? toUpperCase(t("formActions.close"))
              : toUpperCase(t("formActions.cancel"))}
          </Button>

          {mode === "edit" && onDelete && (
            <>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="border-border w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-muted text-muted-foreground px-2">
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
                {toUpperCase(t("formActions.delete"))}
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
