import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "~/App.jsx";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import theme from "~/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      {" "}
      {/* ✅ Thêm BrowserRouter ở đây */}
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <ToastContainer theme="light" position="bottom-right" />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
