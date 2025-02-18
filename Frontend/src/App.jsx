import "./App.css";
import Board from "~/pages/Boards/_id";
import Register from "./pages/Auth/Register";

import Login from "./pages/Auth/Login";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./pages/Auth/GuestRoute";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";

// import { Dashboard } from "@mui/icons-material";
import Board1 from "./pages/Workspaces/_id1";
import Board2 from "./pages/Workspaces/_id2";
import Board3 from "./pages/Workspaces/_id3";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GitHubCallback from "./pages/Auth/GithubCallback";

// import { Box, Container } from "@mui/material";

function App() {
  return (
    <Routes>
     {/* Chỉ cho phép user chưa đăng nhập vào Login & Register */}
     <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Chặn toàn bộ trang nếu chưa đăng nhập */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Board1 />} />
        <Route path="/dashboard" element={<Dashboard />} />
      
        <Route path="/boardcontent" element={<Board />} />
        {/* <Route path="/workspacecontent" element={<Board1 />} /> */}
        <Route path="/listworkspacecontent" element={<Board2 />} />
      </Route>

      <Route path="/auth/callback" element={<GitHubCallback />} />
    </Routes>
  );
}

export default App;
