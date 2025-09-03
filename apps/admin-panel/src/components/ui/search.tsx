import { Search as SearchIcon } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Input } from "./input";
import { toUpperCase } from "@/utils";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";

export const Search: React.FC = () => {
  const searchRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [searchValue, setSearchValue] = useState<string>(
    searchParams.get("search") || ""
  );

  const updateSearchParams = (key: string, value: string) => {
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      updateSearchParams("search", searchValue);
      navigate(`?${searchParams.toString()}`);
    }, 500);

    return () => clearTimeout(handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue]);

  return (
    <div ref={searchRef} className="relative hidden sm:block">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <SearchIcon className="text-muted-foreground h-4 w-4" />
      </div>
      <Input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder={toUpperCase(t("global.search"))}
        className="bg-muted/50 border-border h-10 w-48 rounded-lg pr-4 pl-12 transition-all duration-300 lg:w-96"
      />
    </div>
  );
};
