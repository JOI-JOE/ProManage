import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DefaultLayout from "../components/Layouts/DefaultLayout";
import GuestLayout from "../components/Layouts/GuestLayout";
import Boards from "../pages/boards";
import Dashboard from "../pages/Dashboard";
import Workspaces from "../pages/workspace";
import BoardDetail from "../pages/boards/detail";
import BoardContent from "../pages/boards/detail/BoardContent";
import { mockData } from "../api/Api_fake";
import Home from "../pages/Home";
// import Login from "../pages/auth/Login";

import GoogleAuth from "../pages/Auth/GoogleAuth";
import LoginForm from "../pages/Auth/LoginForm";

const router = createBrowserRouter([
  {
    path: "/", // Path RIÊNG BIỆT cho GuestLayout
    element: <GuestLayout />,
    children: [
      {
        path: "login",
        element: <LoginForm />,
      },
      {
        path: "login/google", // Add this route!
        element: <GoogleAuth />, // Use your GoogleAuth component here
      },
    ],
  },
  {
    path: "/", // Parent route
    element: <DefaultLayout />,
    children: [
      {
        path: "home", // Or perhaps redirect if you have a separate home page
        element: <Home />,
      },
      {
        element: <Dashboard />,
        children: [
          { path: "u/:username/boards", element: <Boards /> },
          { path: "w/:displayName/home", element: <Workspaces /> },
        ],
      },
      {
        path: "b/:id/:displayName",
        element: <BoardDetail />,
        children: [
          {
            path: "",
            element: <BoardContent board={mockData?.board} />,
          },
        ],
      },
    ],
  },
]);

export default router;
