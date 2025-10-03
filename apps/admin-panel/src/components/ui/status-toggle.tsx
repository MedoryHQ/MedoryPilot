import { Label } from "./label";
import { Switch } from "./switch";
import { Badge } from "./badge";
import { cn } from "@/libs";

interface StatusToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  activeLabel?: string;
  inactiveLabel?: string;
  className?: string;
  showBadge?: boolean;
}

export function StatusToggle({
  label,
  description,
  value,
  onChange,
  activeLabel = "Active",
  inactiveLabel = "Inactive",
  className = "",
  showBadge = true
}: StatusToggleProps) {
  return (
    <div
      className={cn(
        "border-border bg-muted/5 flex items-center justify-between rounded-xl border p-6",
        className
      )}
    >
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <Label className="text-lg font-medium">{label}</Label>
          {showBadge && (
            <Badge
              variant={value ? "default" : "secondary"}
              className="px-3 py-1"
            >
              {value ? activeLabel : inactiveLabel}
            </Badge>
          )}
        </div>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className="scale-110"
      />
    </div>
  );
}
