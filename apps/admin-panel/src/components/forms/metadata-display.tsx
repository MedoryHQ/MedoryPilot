import React from "react";
import { Calendar, User, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDate, toUpperCase } from "@/utils";

interface MetadataDisplayProps {
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export const MetadataDisplay: React.FC<MetadataDisplayProps> = ({
  createdAt,
  updatedAt,
  createdBy
}) => {
  const { t, i18n } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Calendar className="h-4 w-4" />
        <span>{toUpperCase(t("ui.metadata"))}</span>
      </div>

      <div className="space-y-3">
        {createdAt && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                {toUpperCase(t("ui.created"))}
              </span>
            </div>

            <span className="text-right text-sm font-medium">
              {formatDate(createdAt, i18n.language, true)}
            </span>
          </div>
        )}

        {updatedAt && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Clock className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                {toUpperCase(t("ui.updated"))}
              </span>
            </div>
            <span className="text-right text-sm font-medium">
              {formatDate(updatedAt, i18n.language, true)}
            </span>
          </div>
        )}

        {createdBy && (
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <User className="text-muted-foreground mt-0.5 h-4 w-4 flex-shrink-0" />
              <span className="text-muted-foreground text-sm">
                {toUpperCase(t("ui.author"))}
              </span>
            </div>
            {updatedAt && (
              <span className="text-right text-sm font-medium">
                {formatDate(updatedAt, i18n.language, true)}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
