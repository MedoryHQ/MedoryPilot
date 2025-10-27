import { Social, PageComponent } from ".";

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
