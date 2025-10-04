import { PageComponent } from "./page-component";
import { Social } from "./social";

export interface FooterResponse {
  data: Footer;
}

export interface Footer {
  id: string;
  phone?: string;
  email?: string;
  socials: Social[];
  pages: PageComponent[];
  createdAt: string;
  updatedAt: string;
}

export type FooterFormValues = {
  phone?: string;
  email?: string;
  socials: string[];
  pages: string[];
};
