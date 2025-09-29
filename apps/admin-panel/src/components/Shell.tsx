import React from "react";
import { Header } from "./Header";
import { useSidebarStore } from "@/store";
import { cn } from "@/libs";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const { collapsed } = useSidebarStore();
  return (
    <div
      className={cn(
        "bg-background relative w-full max-w-[100%] grow scroll-auto",
        collapsed ? "md:max-w-[calc(100%-72px)]" : "md:max-w-[calc(100%-240px)]"
      )}
    >
      <div className="bg-background flex h-full flex-col transition-all duration-200 ease-out">
        <Header />
        <main className="h-[100%] p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
