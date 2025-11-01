export type SingleSelection = Date | undefined;
export type MultipleSelection = Date[] | undefined;
export type RangeSelection = { from?: Date; to?: Date } | undefined;
export type DatePickerSelection =
  | SingleSelection
  | MultipleSelection
  | RangeSelection;

export type DisabledMatcher =
  | ((date: Date) => boolean)
  | { before?: Date; after?: Date }
  | Array<any>
  | undefined;

export interface DatePickerProps {
  value?: DatePickerSelection | null;
  onChange?: (selection: DatePickerSelection | undefined) => void;
  placeholder?: string;
  dateFormat?: string;
  disabled?: boolean;
  className?: string;
  align?: "start" | "center" | "end";
  sideOffset?: number;
  error?: boolean;
  fromDate?: Date;
  toDate?: Date;
  disabledDates?: DisabledMatcher;
  mode?: "single" | "multiple" | "range";
  triggerContent?: React.ReactNode;
  showClearButton?: boolean;
  variant?: "default" | "outline" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  calendarProps?: Record<string, unknown>;
  id?: string;
  name?: string;
  ariaLabel?: string;
}
