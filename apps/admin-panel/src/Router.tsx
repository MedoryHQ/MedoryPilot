import { createBrowserRouter, RouterProvider } from "react-router-dom";

// const createRoutes = (routes: any) => {
//   return Object.values(routes).map((route: any) => {
//     if (!route?.path) {
//       return route;
//     }

//     return {
//       ...route,
//       path: `${route.path}`,
//       element: <></>
//     };
//   });
// };

export const Router = () => {
  const routesWithLayout = [
    {
      path: "/",
      element: <>PraxisSync</>
    }
  ];

  const router = createBrowserRouter(routesWithLayout);

  return <RouterProvider router={router} />;
};
