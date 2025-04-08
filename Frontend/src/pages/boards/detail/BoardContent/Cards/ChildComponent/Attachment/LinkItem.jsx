import React from "react";
import { ListItem, IconButton, Box } from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

// Hàm lấy domain từ link
const getDomain = (url) => {
    try {
        const { hostname } = new URL(url);
        return hostname;
    } catch (e) {
        return "";
    }
};

const LinkItem = ({ file, handleMenuOpen1 }) => {
    const domain = getDomain(file.path_url);

    return (
        <ListItem
            key={file.id}
            sx={{
                backgroundColor: "#DFE1E6",
                borderRadius: "8px",
                p: 0.1,
                px: 2,
                mb: 0.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                "&:hover": {
                    backgroundColor: "#EBECF0",
                },
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", flex: 1, overflow: "hidden" }}>
                {/* Favicon */}
                <img
                    src={`https://www.google.com/s2/favicons?sz=64&domain=${domain}`}
                    alt="favicon"
                    style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "8px",
                        flexShrink: 0,
                    }}
                />

                {/* Link */}
                <Box
                    component="a"
                    href={file.path_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={file.file_name_defaut}
                    sx={{
                        color: "#0052CC",
                        fontSize: "14px",
                        textDecoration: "underline",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flexGrow: 1,
                    }}
                >
                    {file.file_name_defaut}
                </Box>
            </Box>

            {/* Icon ba chấm */}
            <IconButton
                onClick={(e) => {
                    e.stopPropagation(); // Ngăn việc click vào link
                    handleMenuOpen1(e, file);
                }}
                size="small"
                sx={{ ml: 1 }}
            >
                <MoreHorizIcon fontSize="small" sx={{ color: "#6b778c" }} />
            </IconButton>
        </ListItem>
    );
};

export default LinkItem;
