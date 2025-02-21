import React from "react";
import { createRoot } from "react-dom/client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { RouterProvider } from "react-router-dom";
import { ContextProvider } from "./contexts/ContextProvider";
import theme from "~/theme";
import router from "./router/index";

import "../index.css"; // ✅ Import để đảm bảo CSS/Tailwind hoạt động

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer theme="light" position="bottom-right" />{" "}
          {/* ToastContainer có thể ở đây */}
          <RouterProvider router={router} />{" "}
          {/* RouterProvider nên ở trong ThemeProvider */}
        </ThemeProvider>
      </ContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
