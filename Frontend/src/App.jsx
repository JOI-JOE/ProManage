import "./App.css";
import Board from "~/pages/Boards/_id";
import Register from "./pages/Auth/Register";

import Login from "./pages/Auth/Login";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./pages/Auth/GuestRoute";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";
import { Dashboard } from "@mui/icons-material";

// import { Box, Container } from "@mui/material";

function App() {
  return (
    <>
    <Routes>
          {/* Mọi user đều vào Home */}
          {/* <Route path="/" element={<Home />} /> */}

          {/* Chặn user đã đăng nhập vào Login & Register */}
          <Route element={<GuestRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>

          {/* Chỉ cho phép Admin vào Dashboard */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Callback GitHub */}
          {/* <Route path="/auth/callback" element={<GitHubCallback />} /> */}
        </Routes>

      <Board></Board>
    </>
  );
}

export default App;
