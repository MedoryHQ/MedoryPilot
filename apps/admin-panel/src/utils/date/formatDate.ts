import { georgianMonths } from "@/libs";
import dayjs from "dayjs";
import "dayjs/locale/ka";

dayjs.locale("en");

export const formatDate = (
  date: string | Date,
  language: string,
  renderTime?: boolean
) => {
  const day = dayjs(date).date();
  const year = dayjs(date).year();

  if (language === "ka") {
    const month = georgianMonths[dayjs(date).month()];
    return `${day} ${month} ${year} ${
      renderTime ? dayjs(date).format("HH:mm") : ""
    }`;
  } else {
    return dayjs(date).format(`DD MMMM YYYY ${renderTime ? "HH:mm" : ""}`);
  }
};
