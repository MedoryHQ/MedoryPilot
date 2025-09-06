import { motion } from "framer-motion";
import { Button } from "../ui";
import { usePrimaryNavItems } from "@/libs";

interface MobileNavigationBarProps {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onPageChange: (href?: string) => void;
  isActive: (key: string) => boolean;
}

export const MobileNavigationBar: React.FC<MobileNavigationBarProps> = ({
  setIsMenuOpen,
  onPageChange,
  isActive
}) => {
  const primaryNavItems = usePrimaryNavItems();

  const handleNavClick = (item: any) => {
    if (item.action === "openMenu") {
      setIsMenuOpen(true);
    } else {
      onPageChange(item.href);
    }
  };
  return (
    <motion.div
      className="bg-background/95 border-border fixed right-0 bottom-0 left-0 z-50 border-t backdrop-blur-md md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center justify-around px-4 py-2">
        {primaryNavItems.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.1,
              ease: [0.16, 1, 0.3, 1]
            }}
          >
            <Button
              variant="ghost"
              className={`flex h-auto flex-col items-center gap-1 rounded-xl px-4 py-3 ${
                isActive(item.key) && item.key !== "menu"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              } `}
              onClick={() => handleNavClick(item)}
            >
              <motion.div
                whileTap={{ scale: 0.85 }}
                className="flex items-center justify-center"
              >
                {item.icon}
              </motion.div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="h-safe-area-inset-bottom" />
    </motion.div>
  );
};
