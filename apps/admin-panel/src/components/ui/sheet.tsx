"use client";

import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/libs";
import { useTranslation } from "react-i18next";
import { toUpperCase } from "@/utils";

function Sheet(props: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger(
  props: React.ComponentProps<typeof SheetPrimitive.Trigger>
) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose(props: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal(
  props: React.ComponentProps<typeof SheetPrimitive.Portal>
) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay asChild forceMount {...props}>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={cn("fixed inset-0 z-50 bg-black", className)}
        />
      </AnimatePresence>
    </SheetPrimitive.Overlay>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  const { t } = useTranslation();

  const variants = {
    right: { hidden: { x: "100%" }, visible: { x: 0 }, exit: { x: "100%" } },
    left: { hidden: { x: "-100%" }, visible: { x: 0 }, exit: { x: "-100%" } },
    top: { hidden: { y: "-100%" }, visible: { y: 0 }, exit: { y: "-100%" } },
    bottom: { hidden: { y: "100%" }, visible: { y: 0 }, exit: { y: "100%" } }
  };

  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content forceMount {...props} data-slot="sheet-content">
        <AnimatePresence>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants[side]}
            transition={{ type: "tween", duration: 0.3 }}
            className={cn(
              "bg-background fixed z-50 flex flex-col gap-4 overflow-y-auto shadow-lg",
              side === "right" &&
                "inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
              side === "left" &&
                "inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
              side === "top" && "inset-x-0 top-0 max-h-[90vh] border-b",
              side === "bottom" && "inset-x-0 bottom-0 max-h-[90vh] border-t",
              className
            )}
          >
            {children}
            <SheetPrimitive.Close className="focus:ring-ring absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
              <XIcon className="size-4" />
              <span className="sr-only">{toUpperCase(t("global.close"))}</span>
            </SheetPrimitive.Close>
          </motion.div>
        </AnimatePresence>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription
};
