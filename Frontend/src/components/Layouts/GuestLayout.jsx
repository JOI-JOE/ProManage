import React, { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";

const GuestLayout = () => {

  const navigate = useNavigate();
  const { token } = useStateContext();

  useEffect(() => {
    if (token) {
      navigate("/home");
    }
  }, [token, navigate]);

  return (
    <>
      <div>
        <Outlet />
      </div>
    </>
  );
};

export default GuestLayout;
