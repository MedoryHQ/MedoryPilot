"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";

import { useState } from "react";

export function Search() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSearchOpen ? (
        <motion.button
          key="search-icon"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsSearchOpen(true)}
          className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <SearchIcon className="w-5 h-5 text-muted-foreground" />
        </motion.button>
      ) : (
        <motion.form
          key="search-input"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 200, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          onSubmit={handleSearch}
          className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2"
        >
          <SearchIcon className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={() => !searchQuery && setIsSearchOpen(false)}
            placeholder="Search..."
            autoFocus
            className="bg-transparent border-none outline-none text-sm w-full"
          />
        </motion.form>
      )}
    </AnimatePresence>
  );
}
