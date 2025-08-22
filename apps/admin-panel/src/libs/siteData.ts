type SubNavigationItem = {
  name: string;
  href: string;
  requiresId?: boolean;
};

export const subNavigations: Record<string, SubNavigationItem[]> = {};

export const booleanArray = [
  {
    name: "yes"
  },
  {
    name: "no"
  }
];

export const georgianMonths = [
  "იანვარი",
  "თებერვალი",
  "მარტი",
  "აპრილი",
  "მაისი",
  "ივნისი",
  "ივლისი",
  "აგვისტო",
  "სექტემბერი",
  "ოქტომბერი",
  "ნოემბერი",
  "დეკემბერი"
];
