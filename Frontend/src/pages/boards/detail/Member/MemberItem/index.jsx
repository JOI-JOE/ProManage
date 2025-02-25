import React from 'react'
import {
    Box,
    Typography,
    Button,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";

const MemberItem = ({ member }) => {
    console.log(member)
    return (
        <>
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
                    TT
                </Box>
                <Box>
                    <Typography fontWeight="bold">{member.display_name}</Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        @{member.email} • Lần hoạt động gần nhất 02/04
                    </Typography>
                </Box>
            </Box>

            {/* Nút thao tác */}
            <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="outlined" disabled>
                    Xem bảng thông tin (0)
                </Button>
                <Button
                    variant="outlined"
                    disabled
                    startIcon={<HelpOutlineIcon />}
                >
                    Quản trị viên
                </Button>
                <Button
                    variant="outlined"
                    color="error"
                    startIcon={<CloseIcon />}
                >
                    Rời khỏi
                </Button>
            </Box>
        </>
    )
}

export default MemberItem