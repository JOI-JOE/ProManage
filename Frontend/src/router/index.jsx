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
// import GoogleAuth from "../pages/Auth/GoogleAuth";
import GitHubAuth from "../pages/Auth/GitHubAuth";
import GoogleAuth from "../pages/auth/GoogleAuth";
// import LoginForm from "../pages/auth/LoginForm";

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
            {
                path: "auth/callback", // Add this route!
                element: <GitHubAuth />, // Use your GoogleAuth component here
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