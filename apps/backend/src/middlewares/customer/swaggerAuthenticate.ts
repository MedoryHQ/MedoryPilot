import { getEnvVariable } from "@/config";
import auth from "basic-auth";
import { Request, Response, NextFunction } from "express";

export const swaggerAuthenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const credentials = auth(req);

  const check = (name: string, pass: string) => {
    let valid = true;

    const compare = (a: string, b: string) => {
      if (a.length !== b.length) {
        valid = false;
      }
      for (let i = 0; i < a.length; i++) {
        if (a.charCodeAt(i) !== b.charCodeAt(i)) {
          valid = false;
        }
      }
      return valid;
    };

    valid = compare(name, getEnvVariable("SWAGGER_USERNAME")) && valid;
    valid = compare(pass, getEnvVariable("SWAGGER_PASSWORD")) && valid;

    return valid;
  };

  if (credentials && check(credentials.name, credentials.pass)) {
    next();
  } else {
    res.status(401);
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    res.end("Access denied");
  }
};
