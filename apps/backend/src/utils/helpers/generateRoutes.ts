import { Express } from "express";
import * as AdminRoutes from "@/routes/admin";
import * as CustomerRoutes from "@/routes/customer";
import { determineAdminIp } from "@/middlewares/admin";
import { determineCustomerIp } from "@/middlewares/customer/ip";

const adminRouteList = [
  { path: "/auth", router: AdminRoutes.adminAuthRouter },
  { path: "/docs", router: AdminRoutes.SwaggerRouter },
];

const customerRouteList = [
  { path: "/auth", router: CustomerRoutes.userAuthRouter },
];

export const generateRoutes = (app: Express) => {
  const basePath = "/api/v1";
  const adminBasePath = `${basePath}/admin`;

  app.use(adminBasePath, determineAdminIp);
  app.use(basePath, determineCustomerIp);

  adminRouteList?.forEach((route) => {
    app.use(`${adminBasePath}${route.path}`, route.router);
  });

  customerRouteList?.forEach((route) => {
    app.use(`${basePath}${route.path}`, route.router);
  });
};
