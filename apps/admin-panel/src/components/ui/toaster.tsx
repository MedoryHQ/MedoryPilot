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
import { useToast } from "@/hooks/useToast";

const Toaster = () => {
  const { toasts } = useToast();

  const getIcon = (variant?: string) => {
    switch (variant) {
      case "success":
        return <CheckCircle className="h-5 w-5 flex-shrink-0" />;
      case "destructive":
        return <AlertCircle className="h-5 w-5 flex-shrink-0" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 flex-shrink-0" />;
      case "info":
        return <Info className="h-5 w-5 flex-shrink-0" />;
      default:
        return <Info className="h-5 w-5 flex-shrink-0" />;
    }
  };

  return (
    <ToastProvider swipeDirection="right">
      <AnimatePresence mode="popLayout">
        {toasts.map(function ({
          id,
          title,
          description,
          action,
          variant,
          ...props
        }) {
          return (
            <motion.div
              key={id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                scale: 0.5,
                x: 300,
                transition: { duration: 0.2 }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                duration: 0.4
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Toast
                variant={variant}
                {...props}
                className="group relative overflow-hidden border-0 shadow-lg backdrop-blur-sm"
              >
                {/* Gradient Border */}
                <div className="from-border via-border to-border absolute inset-0 rounded-xl bg-gradient-to-r p-[1px]">
                  <div className="bg-background/95 h-full w-full rounded-[11px]" />
                </div>

                {/* Content */}
                <div className="relative flex items-start gap-3 p-4">
                  <div className="mt-0.5 flex-shrink-0">{getIcon(variant)}</div>

                  <div className="flex-1 space-y-1">
                    {title && (
                      <ToastTitle className="font-semibold">{title}</ToastTitle>
                    )}
                    {description && (
                      <ToastDescription className="opacity-90">
                        {description}
                      </ToastDescription>
                    )}
                  </div>

                  {action && <div className="flex-shrink-0">{action}</div>}

                  <ToastClose className="opacity-70 transition-opacity hover:opacity-100" />
                </div>

                <motion.div
                  className="absolute bottom-0 left-0 h-1 bg-current opacity-20"
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 5, ease: "linear" }}
                />
              </Toast>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <ToastViewport />
    </ToastProvider>
  );
};

export { Toaster };
