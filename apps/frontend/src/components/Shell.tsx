import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils";
const shellBase = "w-full";

const shellVariants = cva(shellBase, {
  variants: {
    variant: {
      page: "mx-auto max-w-[1440px] px-6",
      centered: "mx-auto max-w-2xl h-dvh flex flex-col justify-center px-4",
      markdown: "mx-auto max-w-3xl py-8 md:py-10 px-6",
      panel:
        "min-h-dvh w-full max-w-[1440px] mx-auto grid grid-cols-[280px_1fr] gap-6 px-6",
      panelWide:
        "min-h-dvh w-full max-w-[1440px] mx-auto grid grid-cols-[320px_1fr] gap-8 px-8",
      authSplit:
        "min-h-dvh w-full mx-auto max-w-[1440px] grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-8",
      fullBleed: "w-full",
      wrapper:
        "w-full max-w-[1440px] p-3 bg-white/80 backdrop-blur-xl rounded-[32px] border border-black/5 shadow-lg flex justify-between",
    },
    size: {
      sm: "py-6",
      md: "py-10",
      lg: "py-16",
    },
    decor: {
      none: "",
      hero: "bg-hero bg-cover bg-center",
      glass: "backdrop-blur-sm bg-opacity-30",
    },
    bordered: {
      true: "border border-border",
      false: "",
    },
    fluid: {
      true: "max-w-full px-4",
      false: "",
    },
  },
  defaultVariants: {
    variant: "page",
    decor: "none",
    bordered: false,
    fluid: false,
  },
  compoundVariants: [
    {
      variant: "authSplit",
      decor: "hero",
      className: "md:grid-cols-[420px_1fr]",
    },
  ],
});

export type ShellVariantProps = VariantProps<typeof shellVariants>;

export interface ShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    ShellVariantProps {
  as?: React.ElementType;
}

export function Shell({
  className,
  as: Comp = "section",
  variant,
  size,
  decor,
  bordered,
  fluid,
  ...props
}: ShellProps) {
  return (
    <Comp
      className={cn(
        shellVariants({ variant, size, decor, bordered, fluid }),
        className
      )}
      {...props}
    />
  );
}

interface PanelShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar?: React.ReactNode;
  as?: React.ElementType;
  variant?: "panel" | "panelWide";
  stickySidebar?: boolean;
}

export function PanelShell({
  sidebar,
  children,
  as: Comp = "main",
  variant = "panel",
  stickySidebar = true,
  className,
  ...rest
}: PanelShellProps) {
  const sidebarClass = cn(
    "w-full",
    stickySidebar ? "md:sticky md:top-6" : "",
    "h-fit"
  );

  return (
    <Shell
      as={Comp}
      variant={variant}
      className={cn(className, "items-start")}
      {...rest}
    >
      <aside className={sidebarClass} aria-label="Sidebar">
        {sidebar}
      </aside>

      <section className="w-full">{children}</section>
    </Shell>
  );
}

interface AuthShellProps extends React.HTMLAttributes<HTMLDivElement> {
  left: React.ReactNode;
  right?: React.ReactNode;
  leftWidth?: string;
  as?: React.ElementType;
  visualsSticky?: boolean;
}

export function AuthShell({
  left,
  right,
  leftWidth = "md:w-[420px]",
  visualsSticky = true,
  as: Comp = "div",
  className,
  ...rest
}: AuthShellProps) {
  return (
    <Shell
      variant="authSplit"
      decor="hero"
      className={cn(className)}
      as={Comp}
      {...rest}
    >
      <div className={cn("flex flex-col gap-6 py-12", leftWidth)}>{left}</div>

      <div
        className={cn(
          "hidden md:flex items-center justify-center py-12 px-6",
          visualsSticky ? "md:sticky md:top-0" : "",
          "overflow-hidden"
        )}
        aria-hidden={!right}
      >
        {right ?? (
          <div className="w-full max-w-lg">
            <div className="h-80 rounded-2xl shadow-glow bg-gradient-teal" />
          </div>
        )}
      </div>
    </Shell>
  );
}

export { shellVariants, Shell as DefaultShell };
export type { ShellProps as DefaultShellProps };
