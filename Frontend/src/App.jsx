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
import GitHubCallback from "./pages/Auth/GitHubCallback";

// import { Box, Container } from "@mui/material";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
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


      {/* Mọi user đều vào Home */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* </Route> */}

      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/boardconten" element={<Board />} />
      <Route
        path="/workspaces/:workspaceId/boards/:boardId"
        element={<Board />}
      />
      <Route path="/workspaceconten" element={<Board1 />} />
      <Route path="/listworkspaceconten" element={<Board2 />} />
      <Route path="/formconten" element={<Board3 />} />
    </Routes>
    </QueryClientProvider>
  );
}

export default App;
