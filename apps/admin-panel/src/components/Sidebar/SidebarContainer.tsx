import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "../ui";
import { ChevronDown } from "lucide-react";
import { SidebarItem } from "@/types";

interface SideBarContainerProps {
  items: SidebarItem[];
  handleFlyoutEnter: (item: SidebarItem, event: React.MouseEvent) => void;
  handleFlyoutLeave: () => void;
  isMenuExpanded: (menuKey: string) => boolean;
  collapsed: boolean;
  isMobile: boolean;
  toggleMenu: (menuKey: string) => void;
  isActive: (key: string) => boolean;
  onPageChange: (href: string | undefined) => void;
  isChildActive: (parentKey: string, childKey: string) => boolean;
  handleItemClick: (item: SidebarItem) => void;
}

export const SidebarContainer: React.FC<SideBarContainerProps> = ({
  items,
  handleFlyoutEnter,
  handleFlyoutLeave,
  isMenuExpanded,
  collapsed,
  isMobile,
  toggleMenu,
  isActive,
  onPageChange,
  isChildActive,
  handleItemClick
}) => {
  return (
    <div className="sidebar-menu-container">
      <div className="sidebar-menu-list">
        <nav className="space-y-2 p-4">
          {items.map((item) => (
            <div key={item.key} className={`Sidebar_MenuItem_${item.key}`}>
              {item.children ? (
                <div
                  onMouseEnter={(e) => handleFlyoutEnter(item, e)}
                  onMouseLeave={handleFlyoutLeave}
                >
                  <Collapsible
                    open={isMenuExpanded(item.key) && !collapsed && !isMobile}
                    onOpenChange={() => toggleMenu(item.key)}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className={`sidebar-item h-12 w-full justify-start gap-3 text-white/80 transition-all duration-200 hover:text-white ${
                              isActive(item.key) ? "active" : ""
                            }`}
                            onClick={() => handleItemClick(item)}
                          >
                            <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                              {item.icon}
                            </div>

                            <AnimatePresence>
                              {!collapsed && !isMobile && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  exit={{ opacity: 0 }}
                                  className="flex flex-1 items-center justify-between"
                                >
                                  <span className="truncate font-medium">
                                    {item.label}
                                  </span>
                                  <motion.div
                                    animate={{
                                      rotate: isMenuExpanded(item.key) ? 90 : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </motion.div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      {(collapsed || isMobile) && (
                        <TooltipContent
                          side="right"
                          className="sidebar-tooltip"
                        >
                          <p>{item.label}</p>
                        </TooltipContent>
                      )}
                    </Tooltip>

                    <CollapsibleContent className="sidebar-submenu">
                      <AnimatePresence>
                        {item.children.map((child) => (
                          <motion.div
                            key={child.key}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.15 }}
                            className="mt-1"
                          >
                            <Button
                              variant="ghost"
                              className={`sidebar-item h-10 w-full justify-start gap-3 text-white/70 transition-all duration-200 hover:text-white ${
                                isChildActive(item.key, child.key)
                                  ? "active"
                                  : ""
                              }`}
                              onClick={() => onPageChange(child.href)}
                            >
                              <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center">
                                {child.icon}
                              </div>
                              <span className="truncate text-sm font-medium">
                                {child.label}
                              </span>
                            </Button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              ) : (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`sidebar-item h-12 w-full justify-start gap-3 text-white/80 transition-all duration-200 hover:text-white ${
                        isActive(item.key) ? "active" : ""
                      }`}
                      onClick={() => onPageChange(item.href)}
                    >
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                        {item.icon}
                      </div>

                      <AnimatePresence>
                        {!collapsed && !isMobile && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="truncate font-medium"
                          >
                            {item.label}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </Button>
                  </TooltipTrigger>
                  {(collapsed || isMobile) && (
                    <TooltipContent side="right" className="sidebar-tooltip">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};
