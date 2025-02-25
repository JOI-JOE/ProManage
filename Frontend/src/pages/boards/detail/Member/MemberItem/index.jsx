import React from 'react'

const MemberItem = () => {
    return (
        <div id='workspace-member-item'>
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
                    <Typography fontWeight="bold">Trang Nguyễn Thu</Typography>
                    <Typography variant="body2" sx={{ color: "gray" }}>
                        @trangnguyenthu41 • Lần hoạt động gần nhất 02/04
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
        </div>
    )
}

export default MemberItem