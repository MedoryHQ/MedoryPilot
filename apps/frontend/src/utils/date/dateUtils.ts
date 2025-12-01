import dayjs from "dayjs";

export const dateUtils = {
  toDBFormat: (timeStr: string | Date): Date => {
    if (timeStr instanceof Date) {
      return dayjs(timeStr).toDate();
    }

    if (timeStr.includes(":") && !timeStr.includes("T")) {
      return dayjs(timeStr, "HH:mm").toDate();
    }

    return dayjs(timeStr).toDate();
  },

  toClientFormat: (date: Date | string): string => {
    return dayjs(date).format("HH:mm");
  },

  combineDateTime: (date: string | Date, timeStr: string): Date => {
    return dayjs(date)
      .hour(parseInt(timeStr.split(":")[0]))
      .minute(parseInt(timeStr.split(":")[1]))
      .second(0)
      .millisecond(0)
      .toDate();
  }
};
