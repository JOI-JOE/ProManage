import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
} from "@mui/material";
import MyWorkspace from "../../../components/MyWorkspace";
import { useGetWorkspaces } from "../../../hooks/useWorkspace";

const HomeBoard = () => {

    const { data: workspaces, isLoading, isError } = useGetWorkspaces();

    if (isLoading) return <p>Đang tải workspaces...</p>;
    if (isError) return <p>Lỗi khi tải workspaces!</p>;

    return (
        <Box
            sx={{
                width: "60%",
                padding: "20px",
                marginLeft: "auto",
                marginTop: "25px",
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    marginTop: "50px",
                    marginBottom: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                }}
            >
                CÁC KHÔNG GIAN LÀM VIỆC CỦA BẠN
            </Typography>
            <div id="myBoardInWorkspace">
                {workspaces?.map((workspace) => (
                    <MyWorkspace
                        key={workspace.display_name}
                        workspace={workspace}
                        boards={workspace.boards}
                    />
                ))}
            </div>
            {/* END Các không gian làm việc của bạn */}


            {/* Các không gian làm việc của của khách */}
            <Typography
                variant="h6"
                sx={{
                    marginTop: "50px",
                    marginBottom: "10px",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                }}
            >
                CÁC KHÔNG GIAN LÀM VIỆC KHÁCH
            </Typography>
            <div id="myBoardInWorkspace">
                {/* <WorkspaceShare workspace={} boards={} /> */}
                {/* {workspaces?.map((workspace) => (
                    <MyWorkspace
                        key={workspace.display_name}
                        workspace={workspace}
                        boards={workspace.boards}
                    />
                ))} */}
            </div>


            {/* Nút xem tất cả các bảng đã đóng */}
            <Button
                variant="outlined"
                sx={{
                    backgroundColor: "#EDEBFC",
                    height: "30px",
                    width: "250px",
                    marginTop: "40px",
                }}
            >
                Xem tất cả các bảng đã đóng
            </Button>

        </Box>
    );
}

export default HomeBoard