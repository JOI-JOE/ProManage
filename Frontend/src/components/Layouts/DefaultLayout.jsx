import React, { memo } from "react";
import { Outlet } from "react-router-dom";
import AppBar from "../Navigation/AppBar";
import { useStateContext } from "../../contexts/ContextProvider";

const MemoizedAppBar = memo(AppBar); // Gọi memo bên ngoài component

const DefaultLayout = () => {
    const { user } = useStateContext(); // Dùng context để lấy user
    console.log(user)
    return (
        <>
            <MemoizedAppBar username={user?.user_name} email={user?.email} />
            <Outlet />
        </>
    );
};

export default DefaultLayout;
