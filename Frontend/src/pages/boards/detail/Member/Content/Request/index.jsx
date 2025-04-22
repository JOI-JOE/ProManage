import React from 'react'
import {
    Box,
    Typography,
    Paper,
} from "@mui/material";

const RequestContent = () => {
    return (
        <Box id="requests">
            <Paper
                sx={{
                    borderRadius: 1,
                    borderLeft: { xs: 1, md: 0 },
                    height: '100%',
                    p: 1,
                    boxShadow: 'none',
                }}
            >
                <Typography variant="h6" mb={2}>
                    Yêu cầu tham gia (0)
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Không có yêu cầu tham gia nào đang chờ xử lý.
                </Typography>
            </Paper>
        </Box>
    )
}

export default RequestContent