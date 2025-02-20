import React, { useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    Button,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import MyBoard from "./MyBoard";
// import MyWorkspace from "./MyWorkspace";
import MyBoard from "../../../components/MyBoard";
import MyWorkspace from "../../../components/MyWorkspace";

const recentBoard = [
    { id: 1, name: "Bảng thiết kế dự án", displayName: "xObU9h1u" },
    { id: 2, name: "Bảng quản lý khách hàng", displayName: "ssfsf" },
    { id: 3, name: "Bảng công việc nhóm", displayName: "sfkj" },
]

const MyBoardInWorkspace = [
    {
        workspace: {
            name: "Dự án thiết kế thái",
            // ...
            boards: [
                { name: "Bảng thiết kế trang chủ", displayName: "Dự án thiết kế thái - Bảng thiết kế trang chủ" },
                { name: "Bảng thiết kế trang sản phẩm", displayName: "Dự án thiết kế thái - Bảng thiết kế trang sản phẩm" },
                { name: "Bảng thiết kế trang liên hệ", displayName: "Dự án thiết kế thái - Bảng thiết kế trang liên hệ" }
            ]
        }
    }
];

const HomeBoard = () => {
    const [hoveredItem, setHoveredItem] = useState(null);
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
            <Box sx={{ display: "flex", alignItems: "center", marginBottom: "10px" }}>
                <AccessTimeIcon sx={{ marginRight: "8px" }} />
                <Typography variant="h6">Đã xem gần đây</Typography>
            </Box>

            <List sx={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>

                {recentBoard.map((board) => (
                    <ListItem key={board.displayName} sx={{ width: "auto", padding: 0 }}>
                        <MyBoard key={board.displayName} board={board} id={`recent-board-${board.id}`} />
                    </ListItem>
                ))}
            </List>


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
                {/* {MyBoardInWorkspace.map((item) => (
                    <MyWorkspace key={item.workspace.displayName} workspace={item.workspace} boards={item.workspace.boards} />
                ))} */}
            </div>
            {/* ENDư Các không gian làm việc của bạn */}


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