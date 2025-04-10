import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "../Navigation/AppBar";
// import { useStateContext } from "../../contexts/ContextProvider";
import { MeProvider } from "../../contexts/MeContext";

const DefaultLayout = () => {
  return (
    <MeProvider>
      <AppBar />
      <Outlet />
    </MeProvider>
  );
};

export default DefaultLayout;
