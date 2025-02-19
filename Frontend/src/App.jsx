import Board from "~/pages/Boards/_id";
import Register from "./pages/Auth/Register";

import Login from "./pages/Auth/Login";
import { Route, Routes } from "react-router-dom";

// import { Dashboard } from "@mui/icons-material";
import Board1 from "./pages/Workspaces/_id1";
import Board2 from "./pages/Workspaces/_id2";
import Board3 from "./pages/Workspaces/_id3";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import GitHubCallback from "./pages/Auth/GithubCallback";

// import { Box, Container } from "@mui/material";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import GuestRoute from "./pages/Auth/GuestRoute";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
      
        {/* <Route path="/boards" element={<Board />} /> */}
        {/* <Route path="/boards" element={<Board />} /> */}
        {/* <Route path="workspace/:workspaceId/boards" element={<Board1 />} /> */}
        <Route path="/workspace/:workspaceId/boards" element={<Board2 />} />
      </Route>

      <Route path="/auth/callback" element={<GitHubCallback />} />
    </Routes>
    </QueryClientProvider>
  );
}

export default App;
