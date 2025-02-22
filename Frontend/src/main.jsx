import React from "react";
import { createRoot } from "react-dom/client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ContextProvider } from "./contexts/ContextProvider";
import { PusherProvider } from "./contexts/PusherContext"; // Import PusherProvider

import theme from "~/theme";
import router from "./router/index";

import "../index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToastContainer theme="light" position="bottom-right" />{" "}
          {/* ToastContainer có thể ở đây */}
          <PusherProvider>
            <RouterProvider router={router} />{" "}
          </PusherProvider>
        </ThemeProvider>
      </ContextProvider>
    </QueryClientProvider>
  </React.StrictMode>
);