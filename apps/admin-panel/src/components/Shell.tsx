import React from "react";
import { Header } from "./Header";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  return (
    <div className="bg-background min-h-screen">
      <div className="bg-background min-h-screen transition-all duration-200 ease-out">
        <Header />
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
};
