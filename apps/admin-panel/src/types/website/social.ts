import { File } from "../global";

export interface SocialsResponse {
  data: Social[];
  count: number;
}

export interface SocialResponse {
  data: Social;
}

export interface Social {
  id: string;
  icon: File | null;
  name: string;
  url: string;
  footerId: string;
  // footer: Footer;
  createdAt: string;
  updatedAt: string;
}

export type SocialFormValues = {
  icon: File | null;
  name: string;
  url: string;
  footerId: string;
};
