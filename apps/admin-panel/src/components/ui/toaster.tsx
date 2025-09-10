"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport
} from "./toast";
import { CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { cn } from "@/libs";
import { useToast } from "@/hooks";

const getToastStyles = (variant?: string, index?: number) => {
  const baseStyles =
    "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden p-4 shadow-xl backdrop-blur-sm transition-all duration-200 ease-out";

  const radiusVariations = [
    "rounded-xl",
    "rounded-2xl",
    "rounded-lg",
    "rounded-xl rounded-tr-3xl",
    "rounded-xl rounded-bl-3xl"
  ];

  const radius = radiusVariations[index ? index % radiusVariations.length : 0];

  switch (variant) {
    case "success":
      return cn(
        baseStyles,
        radius,
        "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50",
        "border border-green-200 dark:border-green-800/50",
        "text-green-900 dark:text-green-100",
        "shadow-green-100/50 dark:shadow-green-900/20"
      );
    case "destructive":
      return cn(
        baseStyles,
        radius,
        "bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50",
        "border border-red-200 dark:border-red-800/50",
        "text-red-900 dark:text-red-100",
        "shadow-red-100/50 dark:shadow-red-900/20"
      );
    case "warning":
      return cn(
        baseStyles,
        radius,
        "bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/50 dark:to-amber-950/50",
        "border border-yellow-200 dark:border-yellow-800/50",
        "text-yellow-900 dark:text-yellow-100",
        "shadow-yellow-100/50 dark:shadow-yellow-900/20"
      );
    case "info":
      return cn(
        baseStyles,
        radius,
        "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50",
        "border border-blue-200 dark:border-blue-800/50",
        "text-blue-900 dark:text-blue-100",
        "shadow-blue-100/50 dark:shadow-blue-900/20"
      );
    default:
      return cn(
        baseStyles,
        radius,
        "bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-700",
        "border border-slate-200 dark:border-slate-700",
        "text-slate-900 dark:text-slate-100",
        "shadow-slate-100/50 dark:shadow-slate-900/20"
      );
  }
};

const getIcon = (variant?: string) => {
  const iconClass = "h-5 w-5 flex-shrink-0";

  switch (variant) {
    case "success":
      return <CheckCircle className={cn(iconClass, "text-green-500")} />;
    case "destructive":
      return <AlertCircle className={cn(iconClass, "text-red-500")} />;
    case "warning":
      return <AlertTriangle className={cn(iconClass, "text-yellow-500")} />;
    case "info":
      return <Info className={cn(iconClass, "text-blue-500")} />;
    default:
      return <Info className={cn(iconClass, "text-slate-500")} />;
  }
};

const getAccentBarStyles = (variant?: string) => {
  const baseStyles = "absolute left-0 top-0 h-full w-1";

  switch (variant) {
    case "success":
      return cn(
        baseStyles,
        "bg-gradient-to-b from-green-400 to-emerald-500 rounded-l-xl"
      );
    case "destructive":
      return cn(
        baseStyles,
        "bg-gradient-to-b from-red-400 to-rose-500 rounded-l-xl"
      );
    case "warning":
      return cn(
        baseStyles,
        "bg-gradient-to-b from-yellow-400 to-amber-500 rounded-l-xl"
      );
    case "info":
      return cn(
        baseStyles,
        "bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-xl"
      );
    default:
      return cn(
        baseStyles,
        "bg-gradient-to-b from-slate-400 to-slate-500 rounded-l-xl"
      );
  }
};

const getProgressBarStyles = (variant?: string) => {
  const baseStyles = "absolute bottom-0 left-0 h-1 opacity-60";

  switch (variant) {
    case "success":
      return cn(baseStyles, "bg-gradient-to-r from-green-400 to-emerald-500");
    case "destructive":
      return cn(baseStyles, "bg-gradient-to-r from-red-400 to-rose-500");
    case "warning":
      return cn(baseStyles, "bg-gradient-to-r from-yellow-400 to-amber-500");
    case "info":
      return cn(baseStyles, "bg-gradient-to-r from-blue-400 to-indigo-500");
    default:
      return cn(baseStyles, "bg-gradient-to-r from-slate-400 to-slate-500");
  }
};

const getAnimationConfig = (variant?: string, index?: number) => {
  const delay = index ? index * 0.05 : 0;

  const configs: Record<
    string,
    {
      initial: Record<string, any>;
      animate: Record<string, any>;
      exit: Record<string, any>;
    }
  > = {
    success: {
      initial: { opacity: 0, y: 30, scale: 0.9, x: 100 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 25,
          delay
        }
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        x: 100,
        transition: { duration: 0.2 }
      }
    },
    destructive: {
      initial: { opacity: 0, y: -30, scale: 0.95, x: 100 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 300,
          damping: 20,
          delay
        }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        x: 100,
        transition: { duration: 0.25 }
      }
    },
    warning: {
      initial: { opacity: 0, y: 20, scale: 0.95, x: 80 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 350,
          damping: 28,
          delay
        }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        x: 80,
        transition: { duration: 0.2 }
      }
    },
    info: {
      initial: { opacity: 0, y: 40, scale: 0.9, x: 120 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 450,
          damping: 30,
          delay
        }
      },
      exit: {
        opacity: 0,
        scale: 0.9,
        x: 120,
        transition: { duration: 0.3 }
      }
    },
    default: {
      initial: { opacity: 0, y: 30, scale: 0.95, x: 100 },
      animate: {
        opacity: 1,
        y: 0,
        scale: 1,
        x: 0,
        transition: {
          type: "spring" as const,
          stiffness: 400,
          damping: 30,
          delay
        }
      },
      exit: {
        opacity: 0,
        scale: 0.95,
        x: 100,
        transition: { duration: 0.25 }
      }
    }
  };

  return configs[variant || "default"] || configs.default;
};

const Toaster = () => {
  const { toasts } = useToast();

  return (
    <ToastProvider swipeDirection="right">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast, index) => {
          const { id, title, description, action, variant, ...props } = toast;
          const animationConfig = getAnimationConfig(variant, index);

          return (
            <motion.div
              key={id}
              layout
              variants={animationConfig as any}
              initial="initial"
              animate="animate"
              exit="exit"
              whileHover={{
                scale: 1.02,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.98 }}
            >
              <Toast
                variant={variant}
                {...props}
                className={getToastStyles(variant, index)}
              >
                <div className={getAccentBarStyles(variant)} />

                <div className="flex min-w-0 flex-1 items-start gap-3 pl-2">
                  <div className="mt-0.5 flex-shrink-0">{getIcon(variant)}</div>

                  <div className="min-w-0 flex-1 space-y-1">
                    {title && (
                      <ToastTitle className="leading-5 font-semibold">
                        {title}
                      </ToastTitle>
                    )}
                    {description && (
                      <ToastDescription className="leading-5 opacity-80">
                        {description}
                      </ToastDescription>
                    )}
                  </div>
                  {action && <div className="flex-shrink-0">{action}</div>}
                </div>

                <ToastClose
                  className={cn(
                    "absolute top-2 right-2 rounded-lg p-1.5",
                    "opacity-60 transition-all duration-200",
                    "hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/5",
                    "focus:opacity-100 focus:ring-2 focus:ring-current focus:ring-offset-2 focus:outline-none",
                    "text-current"
                  )}
                />

                <motion.div
                  className={getProgressBarStyles(variant)}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{
                    duration: 5,
                    ease: "linear"
                  }}
                />
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <ToastViewport
        className={cn(
          "fixed right-0 bottom-0 z-[2147483647] flex max-h-screen w-full flex-col gap-2 p-4 sm:p-6 md:max-w-[420px]",
          "pointer-events-none"
        )}
      />
    </ToastProvider>
  );
};

export { Toaster };
