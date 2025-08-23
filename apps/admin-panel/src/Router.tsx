import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as Routes from "./routes";
import * as AuthRoutes from "./pages/Auth";

type AnyRoute = {
  path?: string;
  element?: any;
  component?: any;
  [key: string]: any;
};

const renderRouteElement = (route: AnyRoute) => {
  if (React.isValidElement(route.element)) return route.element;

  if (typeof route.element === "function") {
    return React.createElement(route.element);
  }

  if (typeof route.component === "function") {
    return React.createElement(route.component);
  }

  return <></>;
};

const createRoutes = (routesObj: Record<string, AnyRoute> | any) => {
  if (!routesObj) return [];
  return Object.values(routesObj).map((route: any) => {
    if (!route?.path) return route;

    return {
      ...route,
      path: `${route.path}`,
      element: renderRouteElement(route)
    };
  });
};

export const Router = () => {
  const routesWithLayout = [
    {
      path: "/",
      element: <>PraxisSync</>
    },
    ...createRoutes(Routes),
    ...createRoutes(AuthRoutes)
  ];

  const router = createBrowserRouter(routesWithLayout);

  return <RouterProvider router={router} />;
};
