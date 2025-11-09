import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/libs";
import { TranslationsPanelProps } from "@/types";
import { FieldGroup } from "./field-group";

export const TranslationsPanel = <T extends string = string>({
  activeLocale,
  fields,
  values,
  errors = {},
  onChange,
  disabled = false,
  children,
  className = ""
}: TranslationsPanelProps<T>) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeLocale}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6",
          className
        )}
      >
        {children ||
          fields.map((field) => (
            <FieldGroup
              key={field.name}
              label={field.label}
              required={field.required}
              type={field.type}
              placeholder={field.placeholder}
              value={values[field.name] || ""}
              onChange={(value) => onChange(field.name, value)}
              error={errors[field.name]}
              disabled={disabled}
              rows={field.rows}
              maxLength={field.maxLength}
              helperText={field.helperText}
              className={
                field.type === "textarea" || !!field.fullWidth
                  ? "md:col-span-2"
                  : ""
              }
            />
          ))}
      </motion.div>
    </AnimatePresence>
  );
};
