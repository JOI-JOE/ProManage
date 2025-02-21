import React, { useState } from "react";
import {
    Box,
    Typography,
} from "@mui/material";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import PeopleIcon from "@mui/icons-material/People";
import { Link } from "react-router-dom";

const MyBoard = () => { // Nhận dữ liệu board qua props
    const [hoveredItem, setHoveredItem] = useState(null);
    return (
        <Link to={`/b/12214/trang`} style={{ textDecoration: 'none' }}> {/* Wrap with Link */}
            <Box // Removed the extra div
                // component={Link}
                // to={board.link} // Use board.link
                sx={{
                    width: "180px",
                    height: "100px",
                    backgroundColor: "#9c2750",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    "&:hover": { backgroundColor: "#9A436D" },
                    position: 'relative' // For absolute positioning of the star
                }}
                onMouseEnter={() => setHoveredItem(1)}
                onMouseLeave={() => setHoveredItem(null)}
            >
                <PeopleIcon
                    sx={{
                        color: "white",
                        marginRight: "3px",
                    }}
                />
                <Typography
                    sx={{
                        color: "white",
                        fontWeight: "bold",
                        textAlign: "center",
                    }}
                >
                    {/* Use board.name */}
                    sakjklasfjk
                </Typography>
                {hoveredItem === 1 && (
                    <StarBorderIcon
                        sx={{
                            color: "white",
                            position: "absolute",
                            right: "10px",
                            top: "50%", // Center vertically
                            transform: 'translateY(-50%)' // Adjust for exact centering
                        }}
                    />
                )}
            </Box>
        </Link>
    )

}

export default MyBoard