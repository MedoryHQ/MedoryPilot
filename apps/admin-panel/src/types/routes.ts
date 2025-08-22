import { ReactElement } from "react";

export type Route = {
  icon?: ReactElement;
  label?: string;
  key?: string;
  href?: string;
  showInSidebar?: boolean;
  component?: ReactElement;
  children?: Route[];
};
