import React, { useRef, ForwardRefExoticComponent, RefAttributes } from "react";
import { motion } from "framer-motion";
import { Badge, Button, Card, CardContent } from "@/components/ui";
import { toUpperCase } from "@/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { OverviewResponse } from "@/types/website";
import { LucideProps } from "lucide-react";
import { cn } from "@/libs";

interface StatsCardProps {
  config: {
    key: string;
    label: string;
    icon: ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;
  }[];
  className?: string;
  overviewData: OverviewResponse["data"];
}

export const StatsCard: React.FC<StatsCardProps> = ({
  config,
  overviewData,
  className
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const scrollBy = (amount: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: amount,
      behavior: "smooth"
    });
  };

  const scrollLeft = () => scrollBy(-320);
  const scrollRight = () => scrollBy(320);
  return (
    <div className={cn("group stats-slider-container relative", className)}>
      <div className="mb-6 flex items-center justify-between">
        <div className="hidden items-center gap-2 md:flex">
          <Button
            variant="outline"
            size="sm"
            aria-label={toUpperCase(t("overview.prev"))}
            className="h-9 w-9 rounded-full shadow-sm transition-all hover:shadow-md"
            onClick={scrollLeft}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            aria-label={toUpperCase(t("overview.next"))}
            className="h-9 w-9 rounded-full shadow-sm transition-all hover:shadow-md"
            onClick={scrollRight}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="stats-slider-scrollbar flex gap-5 overflow-x-auto px-1 pb-4"
        style={{
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch"
        }}
      >
        {config.map((stat, index) => {
          const Icon = stat.icon;
          const count =
            overviewData[stat.key as keyof OverviewResponse["data"]] ?? 0;

          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1]
              }}
              className="shrink-0"
              style={{ scrollSnapAlign: "start" }}
            >
              <Card
                onClick={() => navigate(`/landing/${stat.key}`)}
                className="stats-card-hover border-border/50 bg-card/80 w-[170px] min-w-[170px] cursor-pointer border backdrop-blur-sm md:w-[260px] md:min-w-[260px]"
              >
                <CardContent className="p-4 pb-4! md:p-6 md:pb-6!">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="bg-primary/10 rounded-2xl p-2 md:p-3">
                        <div className="text-primary">
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                      </div>
                      <Badge
                        variant={count ? "default" : "secondary"}
                        className="rounded-full px-2 py-1 text-xs font-medium"
                      >
                        {toUpperCase(
                          t(count ? "overview.active" : "overview.inactive")
                        )}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="text-foreground text-[20px] leading-none font-bold md:text-3xl">
                        {count}
                      </div>
                      <div className="text-foreground text-[14px] leading-[100%] font-medium md:text-base">
                        {toUpperCase(t(stat.label))}
                      </div>
                      <div className="text-muted-foreground hidden text-sm md:block">
                        {toUpperCase(t("overview.publishedItems"))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
