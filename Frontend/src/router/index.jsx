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

import LoginForm from "../pages/auth/LoginForm";

import ForgotPassword from "../pages/auth/ForgortPassword";
import Register from "../pages/auth/Register";

// import CardModal from "../pages/boards/detail/BoardContent/ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import GitHubAuth from "../pages/auth/GitHubAuth";
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
import ProfileDisplay from "../components/Navigation/Menus/Profile and display/ProfileInfo";
import Activity from "../components/Navigation/Menus/Profile and display/Activity";
// import GitHubAuth from "../pages/auth/GitHsubAuth";
import GoogleAuth from "../pages/auth/GoogleAuth";
import RequestJoinBoard from "../pages/boards/invite/RequestJoinBoard";
import VerifyCodePage from "../pages/auth/VerifyCodePage";
import UpdatePass from "../pages/auth/UpdatePass";
import GanttChart from "../pages/boards/detail/SideBar/GanttChart/GanttChart";


import TagCard from "../components/Navigation/Menus/Profile and display/TagCard";
import ProfileNDisplay from "../components/Navigation/Menus/Profile and display/ProfileNDisplay";
import ProfileInfo from "../components/Navigation/Menus/Profile and display/ProfileInfo";
import TableView from "../pages/boards/detail/SideBar/TableView/TableView";

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
          { path: "w/:workspaceId/home", element: <Workspaces /> },
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
          { path: "w/:workspaceId", element: <Board /> },
          { path: "w/:workspaceId/members", element: <Member /> },
          { path: "w/:workspaceId/account", element: <Account /> },
          { path: "b/:boardId/gantt-chart", element: <GanttChart /> },
          { path: "w/:workspaceId/calendar", element: <Calendar /> },
          { path: "w/:workspaceId/calendar/c/:cardId", element: <CardModal /> },
          { path: "w/:workspaceId/table-view", element: <TableView /> },
        ],
      },
      {
        path: "u/:UserName",
        element: <ProfileInfo />,
        children: [
          { path: "profile", element: <ProfileNDisplay /> },
          { path: "activity", element: <Activity /> },
          { path: "cards", element: <TagCard /> },

          { index: true, element: <Navigate to="profile" replace /> },
        ],
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
        element: <AcceptTeam />, // của workspace
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);

export default router;
