import { Request } from "express";

export const getTokenFromRequest = (req: Request) => {
  const bearer = req.headers["authorization"];
  if (bearer?.startsWith("Bearer ")) {
    return bearer.split(" ")[1];
  }
  return req.cookies?.["accessToken"]?.token;
};
