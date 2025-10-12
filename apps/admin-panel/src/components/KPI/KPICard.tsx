import { cn } from "@/libs";
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: number;
  deltaLabel?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down";
  sparklineData?: number[];
  className?: string;
}

export function KPICard({
  title,
  value,
  delta,
  deltaLabel,
  icon,
  trend,
  sparklineData = [],
  className = ""
}: KPICardProps) {
  const isPositive = delta !== undefined ? delta > 0 : trend === "up";

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="bg-card/50 h-full border-0 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">{title}</p>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <p className="text-2xl font-semibold">{value}</p>
              </motion.div>
              {(delta !== undefined || deltaLabel) && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="flex items-center space-x-1"
                >
                  {delta !== undefined && (
                    <>
                      {isPositive ? (
                        <TrendingUp className="text-success h-3 w-3" />
                      ) : (
                        <TrendingDown className="text-destructive h-3 w-3" />
                      )}
                      <span
                        className={cn(
                          "text-xs",
                          isPositive ? "text-success" : "text-destructive"
                        )}
                      >
                        {delta > 0 ? "+" : ""}
                        {delta}%
                      </span>
                    </>
                  )}
                  {deltaLabel && (
                    <span className="text-muted-foreground text-xs">
                      {deltaLabel}
                    </span>
                  )}
                </motion.div>
              )}
            </div>
            {icon && (
              <motion.div
                initial={{ rotate: 0 }}
                whileHover={{ rotate: 5 }}
                className="bg-accent/10 text-accent rounded-lg p-2"
              >
                {icon}
              </motion.div>
            )}
          </div>

          {sparklineData.length > 0 && (
            <div className="mt-4">
              <svg className="h-8 w-full" viewBox="0 0 100 20">
                <motion.polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-accent"
                  points={sparklineData
                    .map(
                      (value, index) =>
                        `${(index / (sparklineData.length - 1)) * 100},${20 - (value / Math.max(...sparklineData)) * 15}`
                    )
                    .join(" ")}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
              </svg>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
