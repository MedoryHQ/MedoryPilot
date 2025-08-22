import { Admin } from "../administrator";

export interface LoginResponse {
  user: Admin;
  accessToken: string;
}

