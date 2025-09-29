import React, { useRef } from "react";
import { motion } from "framer-motion";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton
} from "@/components/ui";
import { overviewQuickActions, overviewStatsConfig } from "@/libs";
import { useGetOverview } from "@/libs/queries";
import { OverviewResponse } from "@/types/website";
import { toUpperCase } from "@/utils";
import {
  ChevronLeft,
  ChevronRight,
  Edit,
  Navigation as NavIcon
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Overview: React.FC = () => {
  const { data, isFetching } = useGetOverview();
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

  const overviewData: OverviewResponse["data"] = data?.data ?? {
    headers: 0,
    introduce: 0,
    newses: 0,
    services: 0,
    faqs: 0,
    blogs: 0,
    categories: 0,
    contacts: 0,
    footers: 0,
    socials: 0,
    pages: 0,
    tariffs: 0
  };

  const quickActions = overviewQuickActions(t);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-2xl font-semibold">
            {toUpperCase(t("overview.overviewTitle"))}
          </h1>
          <p className="text-muted-foreground mt-1">
            {toUpperCase(t("overview.overviewDescription"))}
          </p>
        </div>
      </div>

      <div className="group stats-slider-container relative my-[40px]">
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
          {overviewStatsConfig.map((stat, index) => {
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
                className="flex-shrink-0"
                style={{ scrollSnapAlign: "start" }}
              >
                <Card
                  onClick={() => navigate(`/landing/${stat.key}`)}
                  className="stats-card-hover border-border/50 bg-card/80 w-[260px] min-w-[260px] cursor-pointer border backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="bg-primary/10 rounded-2xl p-3">
                          <div className="text-primary">
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                        <Badge
                          variant="default"
                          className="rounded-full px-2 py-1 text-xs font-medium"
                        >
                          {toUpperCase(t("overview.active"))}
                        </Badge>
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <div className="text-foreground text-3xl leading-none font-bold">
                          {count}
                        </div>
                        <div className="text-foreground text-base font-medium">
                          {toUpperCase(t(stat.label))}
                        </div>
                        <div className="text-muted-foreground text-sm">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <NavIcon className="h-5 w-5" />
            {toUpperCase(t("overview.actionsTitle"))}
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {isFetching
              ? Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 + i * 0.04 }}
                  >
                    <div className="border-border hover:border-primary/20 bg-card rounded-lg border p-6 transition-all duration-200 hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <Skeleton className="h-12 w-12 rounded-lg" />
                        <div className="flex-1">
                          <Skeleton className="mb-2 h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                        </div>
                        <div className="opacity-0">
                          <Skeleton className="h-4 w-4" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              : quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.key}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 + idx * 0.04 }}
                      className="group cursor-pointer"
                      onClick={() => navigate(`/landing/${action.key}`)}
                    >
                      <div className="border-border hover:border-primary/20 bg-card rounded-lg border p-6 transition-all duration-200 hover:shadow-md">
                        <div className="flex items-start gap-4">
                          <div
                            className={`${action.color} rounded-lg p-3 text-white`}
                          >
                            <Icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <h3 className="group-hover:text-primary mb-2 font-medium transition-colors">
                              {action.label}
                            </h3>
                            <p className="text-muted-foreground text-sm">
                              {action.description}
                            </p>
                          </div>
                          <div className="opacity-0 transition-opacity group-hover:opacity-100">
                            <Edit className="text-muted-foreground h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const OverviewNavigationRoute = {
  element: <Overview />,
  path: "/landing/overview"
};

export default Overview;
