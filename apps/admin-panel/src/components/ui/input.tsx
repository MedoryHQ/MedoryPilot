import * as React from "react";
import { cn } from "@/libs";

type InputVariant = "default" | "auth" | "danger";

interface InputProps extends React.ComponentProps<"input"> {
  variant?: InputVariant;
}

const baseStyles = cn(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
  "dark:bg-input/30 border-input bg-input-background",
  "flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base md:text-sm",
  "transition-[color,box-shadow] outline-none",
  "file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
  "disabled:pointer-events-none  disabled:cursor-not-allowed disabled:opacity-50",
  "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
);

const variantStyles: Record<InputVariant, string> = {
  default: "",
  auth: cn(
    "bg-auth-input-bg border-auth-input-border h-12 rounded-xl px-4",
    "placeholder:text-auth-text-secondary/60 text-auth-text-primary",
    "transition-all duration-200"
  ),
  danger: cn(
    "border-destructive focus:ring-destructive/10 focus:ring-2",
    "placeholder:text-destructive/70 text-destructive"
  )
};

function Input({ className, variant = "default", type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}
    />
  );
}

export { Input };
