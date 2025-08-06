import { Express } from "express";

// const adminRouteList = [];

// const customerRouteList = [];

export const generateRoutes = (app: Express) => {
  const basePath = "/api/v1";
  const adminBasePath = `${basePath}/admin`;

  // adminRouteList?.forEach((route) => {
  //   app.use(`${adminBasePath}${route.path}`, route.router);
  // });

  // customerRouteList?.forEach((route) => {
  //   app.use(`${basePath}${route.path}`, route.router);
  // });
};
