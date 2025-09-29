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
        "bg-background relative min-h-screen w-full max-w-[100%] scroll-auto",
        collapsed ? "md:max-w-[calc(100%-72px)]" : "md:max-w-[calc(100%-240px)]"
      )}
    >
      <div className="bg-background min-h-screen transition-all duration-200 ease-out">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
