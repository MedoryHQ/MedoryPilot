import React, { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger } from "./ui/select";
import { Input } from "./ui/input";

import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Sidebar } from "./Sidebar/Sidebar";
import { useLocation } from "react-router-dom";

interface ShellProps {
  children: React.ReactNode;
}

export const Shell: React.FC<ShellProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768);
  const [language, setLanguage] = useState("en");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const searchRef = React.useRef<HTMLDivElement>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on mobile
      if (mobile && !collapsed) {
        setCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [collapsed]);

  // Search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Get current page title for header
  const getCurrentPageTitle = () => {
    const pageMap: { [key: string]: string } = {
      dashboard: language === "en" ? "Dashboard" : "დაშბორდი",
      appointments: language === "en" ? "Appointments" : "ვიზიტები",
      patients: language === "en" ? "Patients" : "პაციენტები",
      calendar: language === "en" ? "Calendar" : "კალენდარი",
      "examinations-visits": language === "en" ? "Visits" : "ვიზიტები",
      "examinations-list": language === "en" ? "Examinations" : "გამოკვლევები",
      "examinations-documents": language === "en" ? "Documents" : "დოკუმენტები",
      "examinations-create":
        language === "en" ? "Create Examination" : "გამოკვლევის შექმნა",
      messages: language === "en" ? "Messages" : "შეტყობინებები",
      "landing-home": language === "en" ? "Homepage" : "მთავარი გვერდი",
      "landing-services": language === "en" ? "Services" : "სერვისები",
      "landing-news": language === "en" ? "News" : "სიახლეები",
      "landing-blogs": language === "en" ? "Blogs" : "ბლოგები",
      "landing-faq": language === "en" ? "FAQ" : "ხ.დ.კ.",
      "landing-contact": language === "en" ? "Contact" : "კონტაქტი",
      analytics: language === "en" ? "Analytics" : "ანალიტიკა",
      "settings-general":
        language === "en" ? "General Settings" : "მთავარი პარამეტრები",
      "settings-profile":
        language === "en" ? "Profile Settings" : "პროფაილის პარამეტრები",
      "settings-security":
        language === "en" ? "Security Settings" : "უსაფრთხოების პარამეტრები",
      "settings-notifications":
        language === "en"
          ? "Notification Settings"
          : "შეტყობინებების პარამეტრები",
      "settings-appearance":
        language === "en" ? "Appearance Settings" : "გარეგნობის პარამეტრები",
      "settings-system":
        language === "en" ? "System Settings" : "სისტემის პარამეტრები"
    };

    return pageMap[currentPath] || "Dashboard";
  };

  return (
    <div className="site-frame">
      {/* Advanced Sidebar */}
      <Sidebar />

      {/* Main Content Area - Responsive margin */}
      <div
        className="transition-all duration-200 ease-out"
        style={{
          marginLeft: isMobile ? "72px" : collapsed ? "72px" : "240px",
          minHeight: "100vh"
        }}
      >
        {/* Content/MainCard - Simplified content area */}
        <div className="content-main-card">
          {/* Header */}
          <motion.header
            className="bg-card border-border sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-sm md:px-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex flex-1 items-center justify-between">
              {/* Left side - Page Title */}
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-foreground font-semibold">
                    {getCurrentPageTitle()}
                  </h1>
                  <div className="text-muted-foreground text-xs">
                    {language === "en"
                      ? "Medory Admin Panel"
                      : "Medory ადმინ პანელი"}
                  </div>
                </div>
              </div>

              {/* Right side - Search, Language, Theme */}
              <div className="flex items-center gap-4">
                {/* Search Bar - Responsive */}
                <div ref={searchRef} className="relative hidden sm:block">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Search className="text-muted-foreground h-4 w-4" />
                  </div>
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={
                      language === "en" ? "Search anything..." : "ძიება..."
                    }
                    className="bg-muted/50 border-border h-10 w-48 rounded-lg pr-4 pl-12 transition-all duration-300 lg:w-96"
                  />
                </div>

                {/* Language Switcher */}
                <Select
                  value={language}
                  onValueChange={(value: "en" | "ka") => setLanguage(value)}
                >
                  <SelectTrigger className="border-border h-10 w-24 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {language === "en" ? "🇺🇸" : "🇬🇪"}
                      </span>
                      <span className="text-xs font-medium">
                        {language.toUpperCase()}
                      </span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="border-border rounded-lg">
                    <SelectItem value="en" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>🇺🇸</span>
                        <span>English</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ka" className="cursor-pointer">
                      <div className="flex items-center gap-2">
                        <span>🇬🇪</span>
                        <span>Georgian</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Theme Toggle */}
                {/* <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheme}
                  className="h-10 w-10 rounded-lg"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button> */}
              </div>
            </div>
          </motion.header>

          {/* Page Content - Responsive padding */}
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
