"use client";
import { useState } from "react";
import { LocaleSwitcher } from "./LocaleSwitcher";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
      <LocaleSwitcher />
    </header>
  );
};
