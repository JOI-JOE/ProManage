import Board from "~/pages/Boards/_id";
import Register from "./pages/Auth/Register";

import Login from "./pages/Auth/Login";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./pages/Auth/GuestRoute";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import GoogleAuth from "./pages/Auth/GoogleAuth";

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

      {/* <Route path="/auth/callback" element={<GitHubCallback />} /> */}

      {/* Mọi user đều vào Home */}
      <Route path="/" element={<Home />} />
      {/* <Route path="/login/google" element={<GoogleAuth />} /> */}

      {/* Chặn user đã đăng nhập vào Login & Register */}
      {/* <Route element={<GuestRoute />}> */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* </Route> */}

      {/* Chỉ cho phép người đã login vào các trang này */}
      {/* <Route element={<ProtectedRoute />}> */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/boardconten" element={<Board />} />
      <Route path="/workspaceconten" element={<Board1 />} />
      <Route path="/listworkspaceconten" element={<Board2 />} />
      <Route path="/formconten" element={<Board3 />} />
      {/* </Route> */}
    </Routes>
  );
}

export default App;
