import { Footer, File } from ".";

export interface Social {
  id: string;
  icon: File | null;
  name: string;
  url: string;
  footerId: string;
  footer: Footer;
  createdAt: string;
  updatedAt: string;
}
