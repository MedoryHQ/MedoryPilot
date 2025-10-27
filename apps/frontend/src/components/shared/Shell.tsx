import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const shellVariants = cva("flex flex-col relative", {
  variants: {
    variant: {
      default: "container",
      centered: "container flex h-[100dvh] max-w-2xl flex-col justify-center",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface ShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof shellVariants> {
  as?: React.ElementType;
}

function Shell({ className, as: Comp = "div", variant, ...props }: ShellProps) {
  return (
    <Comp className={cn(shellVariants({ variant }), className)} {...props} />
  );
}

export { Shell, shellVariants };
