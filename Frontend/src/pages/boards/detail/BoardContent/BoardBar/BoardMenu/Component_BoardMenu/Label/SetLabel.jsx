import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Button from "@mui/material/Button";
import EditIcon from "@mui/icons-material/Edit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

const SetLabel = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const labels = [
    { name: "aksfj", color: "#66BB6A" },
    { name: "hau", color: "#FFEB3B" },
    { name: "trang", color: "#FF9800" },
    { name: "quan", color: "#FF5722" },
    { name: "viet", color: "#E91E63" },
    { name: "nam", color: "#9C27B0" },
    { name: "thuy", color: "#673AB7" },
    { name: "linh", color: "#3F51B5" },
    { name: "loan", color: "#2196F3" },
    { name: "lightgray", color: "#D3D3D3" },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 320,
          backgroundColor: "#F5F5F5",
          color: "#000",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Typography variant="h6" sx={{ color: "#333", fontWeight: 600 }}>
          Nhãn
        </Typography>

        <IconButton
          sx={{
            borderRadius: "8px",
            padding: "8px 10px",
            color: "#555",
            "&:hover": {
              backgroundColor: "#e0e0e0",
            },
          }}
          onClick={onClose}
        >
          <CloseIcon sx={{ fontSize: "16px" }} />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#40444B" }} />

      <Box sx={{ padding: "0 10px" }}>
        <List>
          {labels
            .filter((label) =>
              label.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((label, index) => (
              <ListItem
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0px 10px",
                  margin: "1px 0px 3px 0px",
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    height: "32px",
                    backgroundColor: label.color,
                    borderRadius: "4px",
                    paddingLeft: "8px",
                    mr: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  }}
                >
                  <ListItemText primary={label.name} sx={{ marginLeft: 0 }} />
                </Box>
                <IconButton
                  edge="end"
                  aria-label="edit"
                  onClick={handleClick} // Open Menu on IconButton click
                  sx={{
                    borderRadius: "4px",
                    padding: "6px 8px",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  <EditIcon sx={{ color: "#1976D2" }} />
                </IconButton>
              </ListItem>
            ))}
        </List>
      </Box>

      <Box sx={{ padding: "16px" }}>
        <Button
          fullWidth
          variant="outlined"
          sx={{
            textTransform: "none",
            borderColor: "#1976D2",
            color: "#1976D2",
            borderRadius: "8px",
            "&:hover": {
              borderColor: "#1976D2",
              backgroundColor: "rgba(25, 118, 210, 0.04)",
            },
          }}
        >
          Tạo nhãn mới
        </Button>
      </Box>

      {/* StyleMenu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}

        anchorOrigin={{ vertical: "top", horizontal: "left" }} // Thay đổi anchorOrigin
        transformOrigin={{ vertical: "top", horizontal: "right" }} // Thay đổi transformOrigin
        PaperProps={{
          style: {
            backgroundColor: "white", // Add white background
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
            width: "300px", // Set width of Menu
            height: "600px", // Set height of Menu
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              textAlign: "center", // Center the text horizontally
              flex: 1, // Ensure it takes available space in a flex container
            }}
          >
            Nhãn
          </Typography>
          <IconButton
            onClick={handleMenuClose}
            sx={{
              borderRadius: "4px",
              padding: "6px 8px",
              "&:hover": {
                backgroundColor: "#e0e0e0",
              },
            }}
          >
            <CloseIcon
              sx={{
                fontSize: "20px",
                color: "grey.600",
              }}
            />
          </IconButton>
        </Box>
        <Box
          sx={{
            margin: "0 - 12px",
            padding: "32px",
            backgroundColor: "#f7f8f9"
          }}
        >
          <Box
            sx={{
              height: "32px", // Adjust height as needed
              backgroundColor: "#66BB6A", // Example color from the image
              borderRadius: "4px",
              mb: "8px", // Add margin bottom
            }}
          />
        </Box>



        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
          <Button variant="contained" color="primary">
            Lưu
          </Button>
          <Button variant="outlined" color="error">
            Xóa
          </Button>
        </Box>
      </Menu>
    </Drawer >
  );
};

export default SetLabel;