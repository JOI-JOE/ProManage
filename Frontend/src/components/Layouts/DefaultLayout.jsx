import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "../Navigation/AppBar";
// import { useStateContext } from "../../contexts/ContextProvider";
import { MeProvider } from "../../contexts/MeContext";
import { WorkspaceProvider } from "../../contexts/WorkspaceContext";

const DefaultLayout = () => {
  return (
    <MeProvider>
      <WorkspaceProvider>
        <AppBar />
        <Outlet />
      </WorkspaceProvider>
    </MeProvider>
  );
};

export default DefaultLayout;
