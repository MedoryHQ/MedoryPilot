import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs";
import { MarkdownEditor } from "../MarkdownRenderer";

interface FieldGroupProps {
  label: string;
  required?: boolean;
  id?: string;
  type?: "text" | "email" | "password" | "number" | "textarea" | "markdown";
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  rows?: number;
  maxLength?: number;
  className?: string;
}

export const FieldGroup: React.FC<FieldGroupProps> = ({
  label,
  required = false,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  id,
  helperText,
  disabled = false,
  rows = 5,
  maxLength,
  className = ""
}) => {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const hasError = !!error;
  const currentLength = value?.length;
  const inputClasses = cn(
    "w-full px-4 py-3 rounded-lg border transition-all bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed",
    hasError
      ? "border-destructive ring-2 ring-destructive/20"
      : "border-border hover:border-border/80"
  );

  const textareaClasses = cn(inputClasses, "resize-none");

  return (
    <div className={cn("space-y-2", className)}>
      <label
        htmlFor={inputId}
        className="text-foreground block text-sm font-medium"
      >
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </label>
      {helperText && !error && (
        <p className="text-muted-foreground -mt-1 text-sm">{helperText}</p>
      )}
      <div className="relative">
        {type === "textarea" ? (
          <>
            <textarea
              id={inputId}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              maxLength={maxLength}
              className={textareaClasses}
              aria-invalid={hasError}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {maxLength && (
              <div className="text-muted-foreground bg-background/80 absolute right-3 bottom-3 rounded px-2 py-1 text-xs">
                {currentLength}/{maxLength}
              </div>
            )}
          </>
        ) : type === "markdown" ? (
          <div
            role="textbox"
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : undefined}
          >
            <MarkdownEditor
              value={value}
              onChange={(v: string) => onChange(v)}
              disabled={disabled}
              className={textareaClasses}
              placeholder={placeholder}
            />
          </div>
        ) : (
          <input
            id={inputId}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={inputClasses}
            aria-invalid={hasError}
            aria-describedby={error ? `${inputId}-error` : undefined}
          />
        )}
      </div>
      {error && (
        <motion.p
          id={`${inputId}-error`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive flex items-center gap-1 text-sm"
          role="alert"
        >
          <svg
            className="h-4 w-4"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
};

export interface FieldRowProps {
  label: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const FieldRow: React.FC<FieldRowProps> = ({
  label,
  children,
  required = false,
  error,
  helperText
}) => {
  return (
    <div className="border-border flex flex-col gap-4 border-b py-4 last:border-0 md:flex-row md:items-start">
      <div className="md:w-1/3">
        <label className="text-foreground block text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
        {helperText && (
          <p className="text-muted-foreground mt-1 text-sm">{helperText}</p>
        )}
      </div>
      <div className="space-y-2 md:w-2/3">
        {children}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive flex items-center gap-1 text-sm"
            role="alert"
          >
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </motion.p>
        )}
      </div>
    </div>
  );
};
