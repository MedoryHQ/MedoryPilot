import { RefObject, useEffect, useRef } from "react";

type Handler = (event: Event) => void;

interface Options {
  enabled?: boolean;
  listenForEscape?: boolean;
  pointerEvent?: "pointerdown" | "mousedown";
}

function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: Handler,
  options: Options = {}
): void {
  const {
    enabled = true,
    listenForEscape = true,
    pointerEvent = "pointerdown",
  } = options;
  const savedHandler = useRef<Handler>(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;
    if (typeof document === "undefined") return;

    const onPointer = (event: Event) => {
      const target = event.target as Node | null;
      if (!ref.current) return;
      if (!target) return;
      if (!ref.current.contains(target)) {
        savedHandler.current(event);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (listenForEscape && event.key === "Escape") {
        savedHandler.current(event);
      }
    };

    document.addEventListener(pointerEvent, onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    if (listenForEscape) document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener(pointerEvent, onPointer);
      document.removeEventListener("touchstart", onPointer);
      if (listenForEscape) document.removeEventListener("keydown", onKey);
    };
  }, [ref, enabled, listenForEscape, pointerEvent]);
}

export default useOnClickOutside;
