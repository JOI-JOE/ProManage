import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DefaultLayout from "../components/Layouts/DefaultLayout";
// import GuestLayout from "../components/Layouts/GuestLayout";
import Boards from "../pages/boards";
import Dashboard from "../pages/Dashboard";
import Workspaces from "../pages/workspace";
import BoardDetail from "../pages/boards/detail";
import BoardContent from "../pages/boards/detail/BoardContent";
// import GoogleAuth from "../pages/auth/GoogleAuth";
import Home from "../pages/Home";
<<<<<<< HEAD
// import Login from "../pages/auth/Login";
// import LoginForm from "../pages/auth/LoginForm";

const router = createBrowserRouter([
  // {
  //     path: "/", // Path RIÊNG BIỆT cho GuestLayout
  //     element: <GuestLayout />,
  //     children: [
  //         {
  //             path: "login",
  //             element: <LoginForm />,
  //         },
  //         {
  //             path: "login/google", // Add this route!
  //             element: <GoogleAuth />, // Use your GoogleAuth component here
  //         },
  //     ],
  // },
=======
import Login from "../pages/auth/Login";
import LoginForm from "../pages/auth/LoginForm";
import Member from "../pages/boards/detail/Member";
import { mockData } from "../api/Api_fake";
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
>>>>>>> 8e8d73643f54dbe2dcd66b8e7b97a0771f53b02e
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
<<<<<<< HEAD
        path: "b/:id/:displayName",
        element: <BoardDetail />,
        children: [
          {
            path: "",
            element: <BoardContent />,
=======
        path: "",
        element: <BoardDetail />,
        children: [
          {
            path: "b/:id/:displayName",
            element: <BoardContent board={mockData?.board} />,
          },
          {
            path: "w/:displayName",
            element: <Member />,
          },
          {
            path: "w/:displayName/members",
            element: <Member />,
>>>>>>> 8e8d73643f54dbe2dcd66b8e7b97a0771f53b02e
          },
        ],
      },
    ],
  },
]);

export default router;
