import { type ClassValue, clsx } from "clsx";
import dayjs from "dayjs";
import { twMerge } from "tailwind-merge";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

dayjs.extend(utc);
dayjs.extend(timezone);

export const formatTime = (dateString: string, minute: boolean) => {
  const tbilisiTime = dayjs(dateString).tz("Asia/Tbilisi");

  if (minute) {
    return tbilisiTime.format("HH:mm");
  } else {
    return tbilisiTime.format("HH");
  }
};

export const toRoman = (num: number) => {
  const romanNumerals = [
    "I",
    "II",
    "III",
    "IV",
    "V",
    "VI",
    "VII",
    "VIII",
    "IX",
    "X",
    "XI",
    "XII",
    "XIII",
    "XIV",
    "XV",
    "XVI",
    "XVII",
    "XVIII",
    "XIX",
    "XX"
  ];
  return romanNumerals[num - 1] || `${num}`;
};
