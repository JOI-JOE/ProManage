import { createBrowserRouter } from "react-router-dom";
import GoogleAuth from "./pages/Auth/GoogleAuth";
import DefaultLayout from "./components/DefaultLayout";
import GuestLayout from "./components/GuestLayout";

import Workspace from "./pages/Workspaces/_id1";
// import Dashboard from "./pages/Dashboard";
// import Board from "./pages/Board";
// import Board1 from "./pages/Board1";
// import Board2 from "./pages/Board2";
// import Board3 from "./pages/Board3";

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      {
        path: "/login/google",
        element: <GoogleAuth />,
      },
    ],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      {
        path: "w/lam9424/home",
        element: <Workspace />,
      },
      // {
      //     path: "dashboard",
      //     element: <Dashboard />,
      // },
      // {
      //     path: "boardconten",
      //     element: <Board />,
      // },
      // {
      //     path: "workspaceconten",
      //     element: <Board1 />,
      // },
      // {
      //     path: "listworkspaceconten",
      //     element: <Board2 />,
      // },
      // {
      //     path: "formconten",
      //     element: <Board3 />,
      // },
    ],
  },
]);

export default router;
