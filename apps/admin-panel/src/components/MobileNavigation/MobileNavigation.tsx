import React, { useState } from "react";
import { Separator, Sheet, SheetContent } from "../ui";
import { useMenuItems } from "@/libs";
import { useNavigate } from "react-router-dom";
import { normalize, pathMatches } from "@/utils";
import {
  NavigationPreferences,
  MobileNavigationMenu,
  MobileNavigationFooter,
  MobileNavigationHeader,
  MobileNavigationBar
} from ".";

export const MobileNavigation: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const items = useMenuItems();
  const current = normalize(window.location.pathname);
  const navigate = useNavigate();
  const onPageChange = (href?: string) => {
    if (href) navigate(`/${href}`);
  };
  const isActive = (key: string) => {
    const candidate = items.find((it) => it.key === key)?.href ?? key;
    return pathMatches(current, candidate);
  };

  return (
    <>
      <MobileNavigationBar
        isActive={isActive}
        onPageChange={onPageChange}
        setIsMenuOpen={setIsMenuOpen}
      />
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent
          side="bottom"
          className="h-[85vh] overflow-hidden rounded-t-3xl border-t-0 p-0"
        >
          <MobileNavigationHeader />
          <div className="flex-1 overflow-y-auto px-6">
            <NavigationPreferences />
            <Separator className="mb-6" />
            <MobileNavigationMenu
              isActive={isActive}
              onPageChange={onPageChange}
              items={items}
              current={current}
              setIsMenuOpen={setIsMenuOpen}
            />
            <MobileNavigationFooter />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
