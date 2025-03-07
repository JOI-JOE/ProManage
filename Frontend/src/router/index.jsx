import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import DefaultLayout from "../components/Layouts/DefaultLayout";
import GuestLayout from "../components/Layouts/GuestLayout";
import Boards from "../pages/boards";
import Dashboard from "../pages/Dashboard";
import Workspaces from "../pages/workspace";
import BoardDetail from "../pages/boards/detail";
import BoardContent from "../pages/boards/detail/BoardContent";
import Member from "../pages/boards/detail/Member";
import Home from "../pages/Home";

import LoginForm from "../pages/Auth/LoginForm";

import ForgotPassword from "../pages/auth/ForgortPassword";
import Register from "../pages/auth/Register";

// import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import GoogleAuth from "../pages/Auth/GoogleAuth";
import GitHubAuth from "../pages/Auth/GitHubAuth";
import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import InviteHandling from "../pages/workspace/invite/InviteHandling";
import InviteWithToken from "../pages/workspace/invite/child/InviteWithToken";
import InviteWithoutToken from "../pages/workspace/invite/child/InviteWithoutToken";

const isAuthenticated = () => !!localStorage.getItem("token");

const LayoutWrapper = () => {
  return isAuthenticated() ? <DefaultLayout><Outlet /></DefaultLayout> : <GuestLayout><Outlet /></GuestLayout>;
};

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
          { path: "w/:workspaceName/home", element: <Workspaces /> },
        ],
      },
      {
        path: "/",
        element: <BoardDetail />,
        children: [
          {
            path: "b/:boardId/:name",
            element: <BoardContent />,
            children: [
              { path: "c/:cardId/:name", element: <CardModal /> }, // CardModal chỉ là Dialog
            ],
          },
          {
            path: "w/:workspaceName/members",
            element: <Member />,
          },
          // {
          //   path: "c/:cardId/:name",
          //   element: <CardModal />,
          // }
        ]
      }
    ]
  },
  {
    path: "invite/:workspaceId/:inviteToken", // Route với token và workspaceId trong URL
    element: <InviteHandling />
  },
  {
    path: "/",
    element: <LayoutWrapper />, // Chọn layout dựa trên trạng thái đăng nhập
    children: [
      {
        path: "invite/accept-team",
        element: isAuthenticated() ? <InviteWithToken /> : <InviteWithoutToken />, // Chỉ hiển thị đúng component khi có đường dẫn
      }
    ],
  },
]);

export default router;
