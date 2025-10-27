import { useEffect } from "react";

export const useDisableBodyScroll = (isOpen: boolean) => {
  useEffect(() => {
    if (typeof document === "undefined" || typeof window === "undefined")
      return;

    const body = document.body;
    const originalOverflow = body.style.overflow;
    const originalPaddingRight = body.style.paddingRight;
    const originalPosition = body.style.position;

    const scrollBarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    const preventTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
    };

    if (isOpen) {
      if (scrollBarWidth > 0) {
        body.style.paddingRight = `${scrollBarWidth}px`;
      }
      body.style.overflow = "hidden";
      body.style.position = "relative";
      document.addEventListener("touchmove", preventTouchMove, {
        passive: false,
      });
    } else {
      body.style.overflow = originalOverflow || "";
      body.style.paddingRight = originalPaddingRight || "";
      body.style.position = originalPosition || "";
    }

    return () => {
      body.style.overflow = originalOverflow || "";
      body.style.paddingRight = originalPaddingRight || "";
      body.style.position = originalPosition || "";
      document.removeEventListener("touchmove", preventTouchMove);
    };
  }, [isOpen]);
};

export default useDisableBodyScroll;
