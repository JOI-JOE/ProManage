import React from 'react';
import { Avatar } from '@mui/material';

const WorkspaceAvatar = ({ workspace, size = 40 }) => {
    return (
        <Avatar
            src={workspace.logo || undefined} // Use logo as the image source if it exists
            sx={{
                background: workspace.logo ? "transparent" : workspace.logo_hash || 'linear-gradient(135deg, #403294, #0747A6);', // Use default hex codes
                color: workspace.logo ? "transparent" : "#fff", // White text color for the letter
                width: size, // Set width based on the passed size prop
                height: size, // Set height based on the passed size prop
                borderRadius: "8px", // Rounded corners to match the screenshot
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)", // Add a subtle shadow for the raised effect
                fontWeight: "bold", // Bold text
                fontSize: `${size / 2}px`, // Adjust font size proportionally to the size prop
                textTransform: "uppercase", // Ensure the letter is uppercase
            }}
        >
            {!workspace.logo && workspace.display_name?.charAt(0)} {/* Show first character if no logo */}
        </Avatar>
    );
};

export default WorkspaceAvatar;
