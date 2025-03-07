import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyBoard from "../../../components/MyBoard";
import MyWorkspace from "../../../components/MyWorkspace";
import { useWorkspaces } from "../../../hooks/useWorkspace";
import WorkspaceShare from "../../../components/WorkspaceShare";
import { useRecentBoards } from "../../../hooks/useBoard";
import { Link } from "react-router-dom";

const HomeBoard = () => {

    const { data: workspaces, isLoading, isError } = useWorkspaces();
    // const { data: recentBoard } = useRecentBoards();
    // console.log(recentBoard);
    
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
            {/* Đã xem gần đây */}
            {/* <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <AccessTimeIcon sx={{ marginRight: "8px" }} />
                <Typography variant="h6">Đã xem gần đây</Typography>
            </Box> */}

            {/* <List sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                {recentBoard?.data?.map((board) => (
                    <ListItem  sx={{ width: "auto", padding: 0 }}>
                        <MyBoard key={board.id}
                    component={Link}
                    to={`/b/${board.id}/${board.name}`} board={board} id={`recent-board-${board.id}`} />
                    </ListItem>
                ))}
            </List> */}


            {/* Các không gian làm việc của bạn */}
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