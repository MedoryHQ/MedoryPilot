"use client";

import { PropsWithChildren } from "react";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function HeroProvider({ children }: PropsWithChildren) {
  const router = useRouter();
  return (
    <HeroUIProvider navigate={router.push}>
      <ToastProvider placement="top-center" />
      {children}
    </HeroUIProvider>
  );
}
