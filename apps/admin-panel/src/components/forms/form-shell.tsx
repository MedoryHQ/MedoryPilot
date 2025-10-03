import React from "react";
import { motion } from "framer-motion";
import { Card } from "../ui";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";
import { cn } from "@/libs";

export type FormMode = "create" | "edit" | "readonly";

export interface FormShellProps {
  title: string;
  subtitle?: string;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  actionBar: React.ReactNode;
  className?: string;
}

export const FormShell: React.FC<FormShellProps> = ({
  title,
  subtitle,
  headerActions,
  children,
  actionBar,
  className = ""
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("mx-auto max-w-7xl space-y-8", className)}
    >
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-4">
            {headerActions}
            <h1 className="text-foreground text-3xl font-semibold">
              {toUpperCase(t(title))}
            </h1>
          </div>
          {subtitle && (
            <p className="text-muted-foreground mt-2">
              {toUpperCase(t(subtitle))}
            </p>
          )}
        </div>
      </div>
      {children}
      <div className="bg-background/95 border-border sticky bottom-0 z-10 -mx-4 border-t px-4 py-4 backdrop-blur-sm lg:hidden">
        {actionBar}
      </div>
    </motion.div>
  );
};

export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  children,
  className = "",
  noPadding = false
}) => {
  const { t } = useTranslation();

  return (
    <Card
      className={cn("border-border/50 overflow-hidden shadow-sm", className)}
    >
      {(title || description) && (
        <div className="border-border/50 bg-muted/20 border-b px-8 py-5">
          {title && (
            <h3 className="mb-1 text-xl font-semibold">
              {toUpperCase(t(title))}
            </h3>
          )}
          {description && (
            <p className="text-muted-foreground text-sm">
              {toUpperCase(t(description))}
            </p>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-8"}>{children}</div>
    </Card>
  );
};

export interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
}

export const TwoColumnLayout: React.FC<TwoColumnLayoutProps> = ({
  left,
  right,
  className = ""
}) => {
  return (
    <div className={cn("grid grid-cols-1 gap-8 lg:grid-cols-3", className)}>
      <div className="space-y-8 lg:col-span-2">{left}</div>
      <div className="space-y-6">{right}</div>
    </div>
  );
};
