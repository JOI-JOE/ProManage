import React from 'react';
import { ListItem, Box, Avatar, Typography, List } from '@mui/material'; // Import necessary components from MUI
import MyBoard from './MyBoard'; // Assuming MyBoard is a custom component
import CreateBoard from './CreateBoard'; // Assuming CreateBoard is a custom component

const WorkspaceShare = ({ workspace, boards }) => { // Ensure workspace and boards are passed as props
    return (
        <div>
            <ListItem
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    gap: "20px",
                }}
            >
                {/* Avatar & Tiêu đề */}
                <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Avatar sx={{ bgcolor: "#5D87FF" }}>
                        {/* {workspace.name.charAt(0).toUpperCase()} */}
                        H
                    </Avatar>
                    <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                        {/* {workspace.name.length > 10 ? workspace.name.substring(0, 20) + "..." : workspace.name} */}
                    </Typography>
                </Box>
            </ListItem>

            {/* Danh sách bảng Trello */}
            <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                {boards?.map((board) => (
                    <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                        <MyBoard key={board.id} board={board} id={`recent-board-${board.id}`} />
                    </ListItem>
                ))}
            </List>
        </div>
    );
}

export default WorkspaceShare;