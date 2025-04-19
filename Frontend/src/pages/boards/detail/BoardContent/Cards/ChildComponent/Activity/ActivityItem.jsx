import React from 'react';
import { Box, Avatar, Typography } from '@mui/material';

const ActivityItem = ({
    item,
    handleOpen,
    open,
    handleClose,
    selectedImage,
    formatTime
}) => {
    const description = item.description;
    const keyword = "đã";
    const keywordIndex = description.indexOf(keyword);
    if (keywordIndex === -1) return null;

    const userName = description.substring(0, keywordIndex).trim();
    const actionText = description.substring(keywordIndex).trim();
    const affectedUser = item.properties?.full_name;

    return (
        <Box display="flex" alignItems="flex-start" mb={1} mt={2}>
            <Avatar sx={{ bgcolor: "pink", width: 28, height: 28, mt: 2, mr: 1.2 }}>
                {userName.charAt(0)}
            </Avatar>
            <Box>
                <Typography>
                    <Typography component="span" fontWeight="bold">
                        {userName}
                    </Typography>{" "}
                    {actionText}
                </Typography>
                <Typography fontSize="0.5rem" color="gray">
                    {formatTime(item.created_at)}
                </Typography>

                {item.properties?.file_path && (
                    <Box mt={1}>
                        <img
                            src={item.properties.file_path}
                            alt="Attachment"
                            style={{ maxWidth: "100%", borderRadius: "8px", cursor: "pointer" }}
                            onClick={() => handleOpen(item.properties.file_path)}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default ActivityItem;