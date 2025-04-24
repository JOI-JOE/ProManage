import React, { memo, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppBar from "../Navigation/AppBar";
import { useStateContext } from "../../contexts/ContextProvider";
import { MeProvider } from "../../contexts/MeContext";
import { WorkspaceProvider } from "../../contexts/WorkspaceContext";

const DefaultLayout = () => {
  const navigate = useNavigate();
  const { token, linkInvite, setLinkInvite } = useStateContext();

  useEffect(() => {
    if (!token) {
      navigate("/login");
    } else if (linkInvite) {
      navigate(linkInvite);
      setLinkInvite(null);
    }
  }, [token, linkInvite, navigate, setLinkInvite]);

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
