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

// import LoginForm from "../pages/Auth/LoginForm";

import ForgotPassword from "../pages/auth/ForgortPassword";
import Register from "../pages/auth/Register";

// import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
// import GoogleAuth from "../pages/Auth/GoogleAuth";
// import GitHubAuth from "../pages/Auth/GitHubAuth";
import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import InviteHandling from "../pages/workspace/invite/InviteHandling";
import InviteWithToken from "../pages/workspace/invite/child/InviteWithToken";
import InviteWithoutToken from "../pages/workspace/invite/child/InviteWithoutToken";
import NotFoundPage from "../pages/NotFoundPage";
import Account from "../pages/boards/detail/Account";
import AcceptTeam from "../pages/workspace/invite/AcceptTeam";
import InvitePage from "../pages/boards/invite/InvitePage";
import AcceptInvitePage from "../pages/boards/invite/AcceptInvitePage";
import Board from "../pages/boards/detail/Board";
import Calendar from "../pages/Boards/detail/SideBar/Calendar/Calendar";
import ProfileDisplay from "../components/Navigation/Menus/Profile and display/ProfileDisplay";
import Activity from "../components/Navigation/Menus/Profile and display/Activity";
import LoginForm from "../pages/auth/LoginForm";
import GoogleAuth from "../pages/auth/GoogleAuth";
import GitHubAuth from "../pages/auth/GitHubAuth";
import RequestJoinBoard from "../pages/boards/invite/RequestJoinBoard";
import VerifyCodePage from "../pages/auth/VerifyCodePage";
import UpdatePass from "../pages/auth/UpdatePass";


const isAuthenticated = () => !!localStorage.getItem("token");

const LayoutWrapper = () => {
  return isAuthenticated() ? (
    <DefaultLayout>
      <Outlet />
    </DefaultLayout>
  ) : (
    <GuestLayout>
      <Outlet />
    </GuestLayout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { path: "login", element: <LoginForm /> },
      { path: "register", element: <Register /> },
      { path: "login/google", element: <GoogleAuth /> },
      { path: "auth/callback", element: <GitHubAuth /> },
      { path: "/forgort-password", element: <ForgotPassword /> },
      { path: "/verify-code", element: <VerifyCodePage /> },
      { path: "/update-password", element: <UpdatePass /> },
     



    ],
  },
  {
    path: "/",
    element: <DefaultLayout />,
    children: [
      { path: "home", element: <Home /> },
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
            children: [{ path: "c/:cardId", element: <CardModal /> }],
          },
          { path: "w/:workspaceName", element: <Board /> },
          { path: "w/:workspaceName/members", element: <Member /> },
          { path: "w/:workspaceName/account", element: <Account /> },
          { path: "w/:workspaceName/calendar", element: <Calendar /> },

        ],
      },
      {
        path: "profile-display",
        element: <ProfileDisplay />,
      },
    ],
  },
  { path: "invite/:workspaceId/:inviteToken", element: <InviteHandling /> },
  {
    path: "/",
    element: <LayoutWrapper />,
    children: [
      {
        path: "request-join/:boardId",
        element: <RequestJoinBoard />,
      },
      {
        path: "invite-board/:token",
        element: <InvitePage />, // Tự động kiểm tra đăng nhập và chuyển hướng
      },
      {
        path: "accept-invite/:token",
        element: <AcceptInvitePage />, // Tự động kiểm tra đăng nhập và chuyển hướng
      },

      {
        path: "invite/accept-team",
        element: <AcceptTeam />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
