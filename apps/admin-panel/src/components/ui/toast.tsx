"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/libs";

const ToastProvider = ToastPrimitive.Provider;

const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 right-0 z-[2147483647] flex max-h-screen w-full flex-col p-4 sm:p-6 md:max-w-[420px]",
      "pointer-events-none",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

const toastVariants = {
  default: {
    container:
      "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100",
    icon: "text-blue-500",
    accent: "bg-blue-500"
  },
  destructive: {
    container:
      "bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/50 text-red-900 dark:text-red-100",
    icon: "text-red-500",
    accent: "bg-red-500"
  },
  success: {
    container:
      "bg-green-50 dark:bg-green-950/50 border border-green-200 dark:border-green-800/50 text-green-900 dark:text-green-100",
    icon: "text-green-500",
    accent: "bg-green-500"
  },
  warning: {
    container:
      "bg-yellow-50 dark:bg-yellow-950/50 border border-yellow-200 dark:border-yellow-800/50 text-yellow-900 dark:text-yellow-100",
    icon: "text-yellow-500",
    accent: "bg-yellow-500"
  },
  info: {
    container:
      "bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-100",
    icon: "text-blue-500",
    accent: "bg-blue-500"
  }
};

const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Root> & {
    variant?: keyof typeof toastVariants;
  }
>(({ className, variant = "default", ...props }, ref) => {
  const variantStyles = toastVariants[variant];

  return (
    <ToastPrimitive.Root
      ref={ref}
      className={cn(
        "group pointer-events-auto relative flex w-full items-start justify-between gap-3 overflow-hidden rounded-xl p-4 shadow-lg",
        "shadow-xl backdrop-blur-sm",
        "transition-all duration-200 ease-out",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)]",
        "data-[swipe=move]:transition-none",
        variantStyles.container,
        className
      )}
      {...props}
    />
  );
});
Toast.displayName = ToastPrimitive.Root.displayName;

const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium transition-all duration-200 dark:border-slate-600 dark:bg-slate-700",
      "hover:border-slate-400 hover:bg-slate-50 dark:hover:border-slate-500 dark:hover:bg-slate-600",
      "focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-800",
      "disabled:pointer-events-none disabled:opacity-50",
      "text-slate-700 dark:text-slate-200",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = ToastPrimitive.Action.displayName;

const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Close
    ref={ref}
    className={cn(
      "absolute top-2 right-2 rounded-lg p-1.5 text-slate-400 dark:text-slate-500",
      "opacity-70 transition-all duration-200",
      "hover:bg-slate-100 hover:text-slate-600 hover:opacity-100 dark:hover:bg-slate-700 dark:hover:text-slate-300",
      "focus:opacity-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:focus:ring-offset-slate-800",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitive.Close>
));
ToastClose.displayName = ToastPrimitive.Close.displayName;

const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Title
    ref={ref}
    className={cn(
      "text-sm leading-5 font-semibold",
      "[&+div]:mt-1 [&+div]:text-xs",
      className
    )}
    {...props}
  />
));
ToastTitle.displayName = ToastPrimitive.Title.displayName;

const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Description
    ref={ref}
    className={cn("text-sm leading-5 opacity-80", className)}
    {...props}
  />
));
ToastDescription.displayName = ToastPrimitive.Description.displayName;

interface ToastContentProps {
  variant?: keyof typeof toastVariants;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const ToastContent: React.FC<ToastContentProps> = ({
  variant = "default",
  title,
  description,
  action
}) => {
  const variantStyles = toastVariants[variant];

  const getIcon = () => {
    const iconClass = cn("h-5 w-5 flex-shrink-0", variantStyles.icon);

    switch (variant) {
      case "success":
        return <CheckCircle className={iconClass} />;
      case "destructive":
        return <AlertCircle className={iconClass} />;
      case "warning":
        return <AlertTriangle className={iconClass} />;
      case "info":
        return <Info className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <>
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-1 rounded-l-xl",
          variantStyles.accent
        )}
      />

      <div className="flex flex-1 items-start gap-3 pl-2">
        <div className="mt-0.5 flex-shrink-0">{getIcon()}</div>
        <div className="min-w-0 flex-1 space-y-1">
          <ToastTitle>{title}</ToastTitle>
          {description && <ToastDescription>{description}</ToastDescription>}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
      <ToastClose />
    </>
  );
};

const MotionToast = React.forwardRef<
  React.ElementRef<typeof Toast>,
  React.ComponentPropsWithoutRef<typeof Toast> & {
    variant?: keyof typeof toastVariants;
    title: string;
    description?: string;
    action?: React.ReactNode;
    duration?: number;
  }
>(
  (
    {
      variant = "default",
      title,
      description,
      action,
      duration = 5000,
      ...props
    },
    ref
  ) => {
    const variantStyles = toastVariants[variant];

    return (
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 30
          }
        }}
        exit={{
          opacity: 0,
          x: 100,
          scale: 0.95,
          transition: { duration: 0.25, ease: "easeInOut" }
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDragEnd={(_, info) => {
          if (info.offset.x > 100 || info.offset.x < -100) {
            props.onOpenChange?.(false);
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <Toast ref={ref} variant={variant} {...props}>
          <ToastContent
            variant={variant}
            title={title}
            description={description}
            action={action}
          />

          {duration > 0 && (
            <motion.div
              className={cn(
                "absolute bottom-0 left-0 h-1 rounded-bl-xl",
                variantStyles.accent,
                "opacity-60"
              )}
              initial={{ width: "100%" }}
              animate={{ width: "0%" }}
              transition={{
                duration: duration / 1000,
                ease: "linear"
              }}
            />
          )}
        </Toast>
      </motion.div>
    );
  }
);
MotionToast.displayName = "MotionToast";

type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export {
  type ToastProps,
  type ToastActionElement,
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
  ToastContent,
  MotionToast
};
