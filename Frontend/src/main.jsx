import React from "react";
import { createRoot } from "react-dom/client";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { Provider } from "react-redux"

import "react-toastify/dist/ReactToastify.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ContextProvider } from "./contexts/ContextProvider";
import theme from "./theme";
// import router from "./router/index";

import store from "./redux/store";
import "../index.css";
import router from "./router";

const queryClient = new QueryClient()

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ContextProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <ToastContainer theme="light" position="bottom-right" />
            <RouterProvider router={router} />
          </ThemeProvider>
        </ContextProvider>
      </QueryClientProvider>
    </Provider>
  </React.StrictMode>
);