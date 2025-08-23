import { createBrowserRouter, RouterProvider } from "react-router-dom";
import * as Routes from "./routes";

const createRoutes = (routes: any) => {
  return Object.values(routes).map((route: any) => {
    if (!route?.path) {
      return route;
    }

    return {
      ...route,
      path: `${route.path}`,
      element: <></>
    };
  });
};

export const Router = () => {
  const routesWithLayout = [
    {
      path: "/",
      element: <>PraxisSync</>
    },
    ...createRoutes(Routes || "")
  ];

  const router = createBrowserRouter(routesWithLayout);

  return <RouterProvider router={router} />;
};
