import { Box, SvgIcon } from "@mui/material";
import React from "react";
import loadingLogo from "~/assets/loading.svg?react"; // Đảm bảo logo SVG được import đúng

const LogoLoading = ({ scale = 0.5 }) => {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
            <SvgIcon
                component={loadingLogo}
                sx={{
                    width: 50, // Kích thước theo tỷ lệ (scale)
                    height: 50, // Kích thước theo tỷ lệ (scale)
                    transform: `scale(${scale})`, // Sử dụng scale trực tiếp
                }}
                viewBox="0 0 24 24"
                inheritViewBox
            />
        </Box>
    );
};

export default LogoLoading;
