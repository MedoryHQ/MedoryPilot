import * as React from "react";

export function useIsMobile(mobileBreakpoint = 768) {
  const [isMobile, setIsMobile] = React.useState<boolean>(false);

  React.useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return;

    const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);

    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set initial value
    setIsMobile(mql.matches);

    // Add listener
    mql.addEventListener("change", onChange);

    return () => mql.removeEventListener("change", onChange);
  }, [mobileBreakpoint]);

  return isMobile;
}
