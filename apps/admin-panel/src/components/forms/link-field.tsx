import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/libs";
import { useTranslation } from "react-i18next";

export interface LinkFieldProps {
  id?: string;
  label?: React.ReactNode;
  value?: string | null;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onChange?: (normalized: string) => void;
  onValidate?: (error?: string) => void;
}

export const LinkField: React.FC<LinkFieldProps> = ({
  id,
  label,
  value,
  placeholder,
  disabled = false,
  required = false,
  className,
  onChange,
  onValidate
}) => {
  const { t } = useTranslation();
  const deriveLocal = (v?: string | null) =>
    v ? String(v).replace(/^https?:\/\//i, "") : "";

  const [local, setLocal] = useState<string>(deriveLocal(value));
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setLocal(deriveLocal(value));
    setFieldError(undefined);
  }, [value]);

  const clearError = () => {
    setFieldError(undefined);
    onValidate?.(undefined);
  };

  const setError = (msg: string) => {
    setFieldError(msg);
    onValidate?.(msg);
  };

  const validateAndNormalize = (raw: string) => {
    const trimmed = raw.trim();
    if (trimmed === "") {
      clearError();
      onChange?.("");
      return;
    }

    if (/^https?:[^/]/i.test(trimmed)) {
      setError(
        t("forms.errors.invalidProtocol") ??
          "Invalid protocol. Use https://example.com or omit protocol."
      );
      return;
    }

    if (/^https?:\/\//i.test(trimmed)) {
      try {
        const parsed = new URL(trimmed);
        if (!parsed.hostname) throw new Error("no host");
        clearError();
        onChange?.(parsed.href);
      } catch {
        setError(t("forms.errors.invalidUrl") ?? "Invalid URL");
      }
      return;
    }

    try {
      const candidate = `https://${trimmed}`;
      const parsed = new URL(candidate);
      if (!parsed.hostname) throw new Error("no host");
      clearError();
      onChange?.(parsed.href);
    } catch {
      setError(t("forms.errors.invalidUrl") ?? "Invalid URL");
    }
  };

  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label
          htmlFor={id}
          className="text-foreground block text-sm font-medium"
        >
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </label>
      )}

      <div className="relative mt-2">
        <div className="flex items-stretch">
          <span
            className={cn(
              "border-border bg-input text-muted-foreground inline-flex items-center rounded-l-lg border border-r-0 px-3 text-sm",
              disabled ? "opacity-50" : ""
            )}
          >
            https://
          </span>

          <input
            id={id}
            type="text"
            value={local}
            onChange={(e) => {
              const v = e.target.value;
              setLocal(v);
              if (fieldError) {
                clearError();
              }

              const trimmed = v.trim();
              if (/^https?:\/\//i.test(trimmed)) {
                try {
                  const parsed = new URL(trimmed);
                  if (parsed.hostname) {
                    clearError();
                    onChange?.(parsed.href);
                  }
                } catch {
                  // ignore
                }
              }
            }}
            onBlur={() => validateAndNormalize(local)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "bg-input text-foreground focus:ring-ring w-full rounded-r-lg border px-4 py-3 transition-all focus:border-transparent focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              fieldError
                ? "border-destructive ring-destructive/20 ring-2"
                : "border-border hover:border-border/80"
            )}
            aria-invalid={!!fieldError}
            aria-describedby={fieldError ? `${id}-error` : undefined}
          />
        </div>
      </div>

      {fieldError ? (
        <motion.p
          id={`${id}-error`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-destructive mt-2 flex items-center gap-1 text-sm"
          role="alert"
        >
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {fieldError}
        </motion.p>
      ) : null}
    </div>
  );
};

export default LinkField;
