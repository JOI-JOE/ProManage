import {
    Box,
    Typography,
    Paper,
} from "@mui/material";

const GuestContent = () => {
    return (
        <Box id="guests">
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
                    Khách (0)
                </Typography>
                <Typography variant="body2" color="textSecondary" mb={2}>
                    Hiện tại không có khách trong không gian làm việc.
                </Typography>
            </Paper>
        </Box>
    )
}

export default GuestContent