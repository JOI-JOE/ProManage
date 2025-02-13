import "./App.css";
import Board from "~/pages/Boards/_id";
import Register from "./pages/Auth/Register";

import Login from "./pages/Auth/Login";
import { Route, Routes } from "react-router-dom";
import GuestRoute from "./pages/Auth/GuestRoute";
import ProtectedRoute from "./pages/Auth/ProtectedRoute";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

// import { Dashboard } from "@mui/icons-material";
import Board1 from "./pages/Boards/_id1";
import Board2 from "./pages/Boards/_id2";
import Board3 from "./pages/Boards/_id3";

// import { Box, Container } from "@mui/material";

function App() {
  return (
    <>
      <Routes>
        {/* Mọi user đều vào Home */}
        <Route path="/" element={<Home />} />

        {/* Chặn user đã đăng nhập vào Login & Register */}

        {/* Chỉ cho phép Admin vào Dashboard */}
        {/* <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route path="http://127.0.0.1:8000/admin" element={<Dashboard />} />
          </Route> */}

        {/* Callback GitHub */}
        {/* <Route path="/auth/callback" element={<GitHubCallback />} /> */}
      </Routes>

      {/* <Board></Board> */}

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
        <Route path="/boardconten" element={<Board />} />
        <Route path="/" element={<Board1 />} />
        <Route path="/listworkspaceconten" element={<Board2 />} />
        <Route path="/formconten" element={<Board3 />} />
      </Routes>
    </>
  );
}

export default App;
