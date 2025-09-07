// Search.tsx
import { Search as SearchIcon } from "lucide-react";
import { useRef, useEffect } from "react";
import { Input } from "./input";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { SearchResult } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface SearchProps {
  setShowSearchResults: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchResults: React.Dispatch<React.SetStateAction<SearchResult[]>>;
  searchQuery: string;
  isMobile: boolean;
  searchFocused: boolean;
}

const searchableData: SearchResult[] = [
  {
    id: "p1",
    type: "patient",
    name: "John Smith",
    category: "Patients",
    icon: "👤"
  },
  {
    id: "p2",
    type: "patient",
    name: "Emma Wilson",
    category: "Patients",
    icon: "👤"
  },
  {
    id: "d1",
    type: "document",
    name: "Form 100 - John Smith",
    category: "Documents",
    icon: "📄"
  },
  {
    id: "b1",
    type: "blog",
    name: "Healthcare Digital Transformation",
    category: "Blogs",
    icon: "📝"
  },
  {
    id: "a1",
    type: "appointment",
    name: "Consultation with Dr. Johnson",
    category: "Appointments",
    icon: "📅"
  }
];

export const Search: React.FC<SearchProps> = ({
  setSearchFocused,
  setShowSearchResults,
  setSearchQuery,
  setSearchResults,
  isMobile,
  searchFocused,
  searchQuery
}) => {
  const searchRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = searchableData.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = searchRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setSearchFocused(false);
        setShowSearchResults(false);
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [setSearchFocused, setShowSearchResults]);

  const handleItemClick = (item: SearchResult) => {
    setShowSearchResults(false);
    setSearchQuery("");
    navigate(`/${item.type}/${item.id}`);
  };

  const containerVariant = {
    hidden: { opacity: 0, y: -6, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1 }
  };

  const wrapperClass =
    isMobile && searchFocused
      ? "absolute left-4 right-4 top-2 z-40"
      : "relative block";

  return (
    <motion.div
      ref={searchRef}
      animate={{
        x: !isMobile && searchFocused ? -16 : 0
      }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className={wrapperClass}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="text-muted-foreground h-4 w-4" />
      </div>

      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        placeholder={toUpperCase(t("global.search"))}
        className={`bg-muted/50 text-foreground border-border h-10 rounded-lg pr-4 pl-12 transition-all duration-300 ${isMobile ? (searchFocused ? "w-full" : "w-40") : "w-48 lg:w-96"}`}
        style={{
          width: undefined
        }}
      />
    </motion.div>
  );
};
