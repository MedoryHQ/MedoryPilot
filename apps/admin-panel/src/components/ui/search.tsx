import { Search as SearchIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Input } from "./input";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";

export const Search: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };
  const { t } = useTranslation();

  return (
    <div ref={searchRef} className="relative hidden sm:block">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="text-muted-foreground h-4 w-4" />
      </div>
      <Input
        type="text"
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={toUpperCase(t("global.search"))}
        className="bg-muted/50 border-border h-10 w-48 rounded-lg pr-4 pl-12 transition-all duration-300 lg:w-96"
      />
    </div>
  );
};
