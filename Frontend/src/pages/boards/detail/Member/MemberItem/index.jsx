import React from 'react'
import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const MemberItem = ({ member }) => {
    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            {/* Phần thông tin thành viên */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: "#0079BF",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        fontWeight: "bold",
                    }}
                >
                    {member?.name?.charAt(0)}
                </Box>
                <Box>
                    <Typography fontWeight="bold">{member?.name}</Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        @{member.email} • {member.last_active}
                    </Typography>
                </Box>
            </Box>

            {/* Nút thao tác */}
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" disabled>
                    Xem bảng thông tin (0)
                </Button>
                <Button variant="outlined" disabled startIcon={<HelpOutlineIcon />}>
                    {member.member_type}
                </Button>
                <Button variant="outlined" color="error" startIcon={<CloseIcon />}>
                    Rời khỏi
                </Button>
            </Box>
        </div>
    )
}

export default MemberItem