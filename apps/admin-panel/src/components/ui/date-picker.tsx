import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Button } from "./button";
import { Calendar as CalendarWrapper } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { cn } from "@/libs";
import {
  DatePickerProps,
  DatePickerSelection,
  DisabledMatcher,
  MultipleSelection,
  RangeSelection,
  SingleSelection
} from "@/types/ui";
import { formatDate } from "@/utils";
import { useTranslation } from "react-i18next";

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  disabled = false,
  className,
  align = "start",
  sideOffset = 4,
  error = false,
  fromDate,
  toDate,
  disabledDates,
  mode = "single",
  triggerContent,
  showClearButton = false,
  variant = "outline",
  size = "default",
  calendarProps,
  id,
  name,
  ariaLabel
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const { i18n } = useTranslation();
  const disabledProp: DisabledMatcher =
    disabledDates ??
    (fromDate || toDate
      ? {
          before: fromDate ?? undefined,
          after: toDate ?? undefined
        }
      : undefined);

  const handleSelect = React.useCallback(
    (selected: unknown) => {
      onChange?.(selected as DatePickerSelection | undefined);
      if (mode === "single") {
        if (selected === undefined || selected instanceof Date) {
          setOpen(false);
        }
      }
    },
    [onChange, mode]
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange?.(undefined);
    },
    [onChange]
  );

  const displayNode = React.useMemo(() => {
    if (triggerContent) return triggerContent;
    if (!value)
      return <span className="text-muted-foreground">{placeholder}</span>;

    try {
      if (mode === "single") {
        const d = value as SingleSelection;
        if (d instanceof Date)
          return <span>{formatDate(d, i18n.language)}</span>;
      }

      if (mode === "range") {
        const r = value as RangeSelection;
        const from = r?.from;
        const to = r?.to;
        if (from && to) {
          return (
            <span>{`${formatDate(from, i18n.language)} — ${formatDate(to, i18n.language)}`}</span>
          );
        }
        if (from)
          return <span>{`From ${formatDate(from, i18n.language)}`}</span>;
        if (to) return <span>{`Until ${formatDate(to, i18n.language)}`}</span>;
      }

      if (mode === "multiple") {
        const arr = (value as MultipleSelection) ?? [];
        if (Array.isArray(arr) && arr.length > 0)
          return (
            <span>
              {arr.map((d) => formatDate(d, i18n.language)).join(", ")}
            </span>
          );
      }

      return <span>{String(value)}</span>;
    } catch {
      return <span className="text-muted-foreground">{placeholder}</span>;
    }
  }, [value, mode, dateFormat, placeholder, triggerContent]);

  const newApiProps = {
    selected: value as any,
    onSelect: handleSelect as any,
    disabled: disabledProp as any
  };

  const oldApiProps = {
    selectedDays: value as any,
    onDayClick: (day: Date | undefined) => handleSelect(day as any),
    disabledDays: disabledProp as any
  };

  const Calendar = CalendarWrapper as any;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant={variant}
          size={size}
          disabled={disabled}
          aria-label={ariaLabel || placeholder}
          aria-expanded={open}
          aria-haspopup="dialog"
          className={cn(
            "bg-input min-h-[44px] w-full justify-start px-4 py-3 text-left font-normal",
            "flex items-center",
            !value && "text-muted-foreground",
            error && "border-destructive focus-visible:ring-destructive/20",
            className
          )}
          type="button"
        >
          <div className="flex w-full items-center justify-between">
            <span className="flex flex-1 items-center truncate">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {displayNode}
            </span>
            {showClearButton && value && !disabled && (
              <button
                onClick={handleClear}
                className="ml-2 h-4 w-4 shrink-0 opacity-50 transition-opacity hover:opacity-100"
                aria-label="Clear date"
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto p-0"
        align={align}
        sideOffset={sideOffset}
      >
        <Calendar
          mode={mode}
          {...newApiProps}
          {...oldApiProps}
          {...(calendarProps ?? {})}
          initialFocus
        />
      </PopoverContent>

      {name && (
        <input
          type="hidden"
          name={name}
          value={
            !value
              ? ""
              : mode === "single" && (value as Date) instanceof Date
                ? (value as Date).toISOString()
                : JSON.stringify(value)
          }
        />
      )}
    </Popover>
  );
}
