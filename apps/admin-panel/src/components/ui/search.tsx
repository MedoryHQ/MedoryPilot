import React, {
  useRef,
  useEffect,
  useMemo,
  useCallback,
  useState
} from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "./input";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SearchResult } from "@/types";
import { AnimatePresence, motion } from "framer-motion";

interface SearchProps {
  setSearchFocused: React.Dispatch<React.SetStateAction<boolean>>;
  isMobile: boolean;
  searchFocused: boolean;
}

// TODO: add query for search
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
    id: "p3",
    type: "patient",
    name: "Emma Wilson",
    category: "Patients",
    icon: "👤"
  },
  {
    id: "p4",
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
  isMobile,
  searchFocused
}) => {
  const searchRef = useRef<HTMLDivElement | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const { t } = useTranslation();
  const navigate = useNavigate();

  const filteredResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return searchableData.filter((it) => it.name.toLowerCase().includes(q));
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      setSearchResults(filteredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, filteredResults, setSearchResults]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const el = searchRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) {
        setSearchFocused(false);
      }
    };

    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [setSearchFocused]);

  const handleSearch = useCallback(
    (q: string) => {
      setSearchQuery(q);
    },
    [setSearchQuery]
  );

  const blurActive = useCallback(() => {
    try {
      const active = document.activeElement as HTMLElement | null;
      active?.blur();
    } catch {
      /* ignore */
    }
  }, []);

  const handleItemClick = useCallback(
    (item: SearchResult) => {
      setSearchQuery("");
      setSearchFocused(false);
      blurActive();
      navigate(`/${item.type}/${item.id}`);
    },
    [navigate, setSearchFocused, setSearchQuery, blurActive]
  );

  const handleSeeAll = useCallback(() => {
    const seeAllUrl = `/search?query=${encodeURIComponent(searchQuery)}`;
    setSearchQuery("");
    setSearchFocused(false);
    blurActive();
    navigate(seeAllUrl);
  }, [navigate, searchQuery, setSearchFocused, setSearchQuery, blurActive]);

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
      animate={{ x: !isMobile && searchFocused ? -16 : 0 }}
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
        className={`bg-muted/50 text-foreground border-border h-10 rounded-lg pr-4 pl-12 transition-all duration-200 ${
          isMobile
            ? searchFocused
              ? "w-full"
              : "w-40"
            : "w-48 md:w-[250px] lg:w-96"
        }`}
        style={{ width: undefined }}
      />

      <AnimatePresence>
        {searchFocused &&
          filteredResults.length >= 0 &&
          searchQuery.trim().length > 0 && (
            <motion.div
              key="search-results"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={containerVariant}
              transition={{ duration: 0.16 }}
              className={`border-border bg-background absolute z-50 overflow-hidden rounded-xl border shadow-lg backdrop-blur-md ${
                isMobile && searchFocused
                  ? "top-full left-0 mt-2 w-full"
                  : "top-12 right-0 w-[250px] lg:w-96"
              } `}
            >
              <div className="search-bar-list max-h-80 overflow-y-auto">
                {filteredResults.length > 0
                  ? filteredResults.map((item, idx) => (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.12, delay: idx * 0.03 }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleItemClick(item);
                        }}
                        className="hover:bg-muted border-border flex w-full cursor-pointer items-center gap-3 border-b p-3 text-left last:border-b-0"
                      >
                        <span className="text-xl">{item.icon}</span>
                        <div className="min-w-0 flex-1">
                          <div className="text-foreground truncate text-sm font-medium">
                            {item.name}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {item.category}
                          </div>
                        </div>
                      </motion.button>
                    ))
                  : null}
              </div>
              <div
                onClick={() => handleSeeAll()}
                className="text-primary hover:bg-primary/10 flex cursor-pointer items-center justify-center p-4 text-[14px] font-medium transition-all duration-200 md:text-[14px]"
              >
                {toUpperCase(t("search.seeAllResults"))}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </motion.div>
  );
};
