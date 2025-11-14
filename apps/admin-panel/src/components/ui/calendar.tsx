import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { cn } from "@/libs";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        caption_label: "text-sm font-medium leading-[36px] h-min flex-1",
        nav_button_previous: "order-1",
        nav_button_next: "order-3",
        selected: "bg-accent text-primary-foreground dark:bg-accent/50",
        table: "w-full border-collapse",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] leading-8",
        row: "flex w-full mt-2",
        cell: "relative p-0 text-center text-sm w-9 h-9 flex items-center justify-center",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 hover:text-primary-foreground! rounded-md inline-flex items-center justify-center text-sm font-normal transition"
        ),
        day_today:
          "border border-primary/30 text-primary-foreground hover:bg-primary/10",
        day_selected:
          "bg-primary text-primary-foreground shadow-sm ring-2 ring-offset-2 ring-primary/40",
        day_range_middle: "bg-primary/10 text-primary-foreground",
        day_range_start:
          "rounded-l-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_range_end:
          "rounded-r-md aria-selected:bg-primary aria-selected:text-primary-foreground",
        day_outside: "text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50 pointer-events-none",
        day_hidden: "invisible",
        ...classNames
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left") {
            return <ChevronLeft className={cn("size-4")} />;
          }
          return <ChevronRight className={cn("size-4")} />;
        }
      }}
      {...props}
    />
  );
}

export { Calendar };
