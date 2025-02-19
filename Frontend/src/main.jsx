import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import theme from "~/theme";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserRouter } from "react-router-dom";

import { ContextProvider } from "./contexts/ContextProvider";
import App from "~/App.jsx";
// import router from "./router";

createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
  //   <ContextProvider>
  //     <ThemeProvider theme={theme}>
  //       <CssBaseline />
  //       <ToastContainer theme="light" position="bottom-right" />
  //       <RouterProvider router={router} />
  //     </ThemeProvider>
  //   </ContextProvider>
  // </React.StrictMode >

  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
        <ToastContainer theme="light" position="bottom-right" />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>

);
