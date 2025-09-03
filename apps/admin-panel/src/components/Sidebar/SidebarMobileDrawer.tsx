import React from "react";
import { Button, Sheet, SheetContent } from "../ui";
import { ArrowLeft } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import { SidebarItem } from "@/types";
import { useLocation } from "react-router-dom";

const normalize = (p?: string) => (p ? p.replace(/^\/|\/$/g, "") : "");
const pathMatches = (current: string, candidate?: string) =>
  !!candidate && (current === candidate || current.startsWith(candidate + "/"));

interface SidebarMobileDrawerProps {
  setMobileDrawer: Dispatch<
    SetStateAction<{
      open: boolean;
      item: SidebarItem | null;
    }>
  >;
  mobileDrawer: {
    open: boolean;
    item: SidebarItem | null;
  };
  onPageChange: (href: string | undefined) => void;
}

export const SidebarMobileDrawer: React.FC<SidebarMobileDrawerProps> = ({
  setMobileDrawer,
  mobileDrawer,
  onPageChange
}) => {
  const location = useLocation();
  const current = normalize(location.pathname);

  return (
    <Sheet
      open={mobileDrawer.open}
      onOpenChange={(open) => setMobileDrawer({ open, item: null })}
    >
      <SheetContent side="left" className="sidebar-drawer-mobile w-full p-0">
        <div className="sidebar-drawer-header">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileDrawer({ open: false, item: null })}
              className="h-8 w-8 rounded-lg text-white/80 hover:bg-white/10 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              {mobileDrawer.item?.icon}
              <h2 className="text-lg font-semibold text-white">
                {mobileDrawer.item?.label}
              </h2>
            </div>
          </div>
        </div>

        <div className="sidebar-drawer-content p-3">
          {mobileDrawer.item?.children?.map((child) => {
            const childPath = normalize(child.href);
            const active = pathMatches(current, childPath);

            return (
              <Button
                key={child.key}
                variant="ghost"
                className={`mb-2 h-12 w-full justify-start gap-3 rounded-lg text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white ${
                  active ? "bg-white/10 text-white" : ""
                }`}
                onClick={() => {
                  onPageChange(child.href);
                  setMobileDrawer({ open: false, item: null });
                }}
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {child.icon}
                </div>
                <span className="font-medium">{child.label}</span>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
