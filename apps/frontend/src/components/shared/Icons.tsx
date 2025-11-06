import { cn } from "@/utils";
import { SVGProps } from "react";

type SvgExtendedProps = SVGProps<SVGSVGElement> & {
  active?: boolean;
  size?: string | number;
  color?: string;
};

export const Icons = {
  LanguageLoader: (props: SvgExtendedProps) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={cn("w-4 h-4 animate-spin", props.className)}
      {...props}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="#025661"
        strokeWidth="3"
        opacity="0.2"
      />
      <path
        d="M22 12a10 10 0 00-10-10"
        stroke="#025661"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  ),
} as const;
