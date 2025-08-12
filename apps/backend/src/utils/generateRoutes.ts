import { Express } from "express";
import * as AdminRoutes from "../routes/admin";

const adminRouteList = [{ path: "/auth", router: AdminRoutes.authRouter }];

// const customerRouteList = [];

export const generateRoutes = (app: Express) => {
  const basePath = "/api/v1";
  const adminBasePath = `${basePath}/admin`;

  adminRouteList?.forEach((route) => {
    app.use(`${adminBasePath}${route.path}`, route.router);
  });

  // customerRouteList?.forEach((route) => {
  //   app.use(`${basePath}${route.path}`, route.router);
  // });
};
