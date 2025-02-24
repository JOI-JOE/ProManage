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

import LoginForm from "../pages/Auth/LoginForm";

import GitHubAuth from "../pages/Auth/GitHubAuth";
import ForgotPassword from "../pages/auth/ForgortPassword";
import Register from "../pages/auth/Register";
import GoogleAuth from "../pages/Auth/GoogleAuth";

import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";


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
                path: "register",
                element: <Register />,
            },
            {
                path: "login/google", // Add this route!
                element: <GoogleAuth />, // Use your GoogleAuth component here
            },
            {
                path: "auth/callback", // Add this route!
                element: <GitHubAuth />, // Use your GoogleAuth component here
            },
            {
              path: "/forgort-password", // Add this route!
              element: <ForgotPassword />, // Use your GoogleAuth component here
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
                    { path: "w/:displayName/home", element: <Workspaces /> }
                ]
            },
            {
                path: "/",
                element: <BoardDetail />,
                children: [
                    {
                        path: "b/:boardId/:name",
                        element: <BoardContent />,
                    },
                    {
                        path: "c/:cardId/:name",
                        element: <CardModal />,
                    },
                    // {
                    //   path: "w/:displayName",
                    //   element: <Member />,
                    // },
                    // {
                    //   path: "w/:displayName/members",
                    //   element: <Member />,
                    // },
                ]
            }
        ]
    },

  
    ]);
  
    
export default router;