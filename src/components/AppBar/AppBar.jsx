import {
  Badge,
  Box,
  Button,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AppsIcon from "@mui/icons-material/Apps";
import trelloLogo from "~/assets/trello.svg?react";

import SvgIcon from "@mui/material/SvgIcon";
import Workspace from "./Menus/Workspace";
import Recent from "./Menus/Recent";
import Started from "./Menus/Started";
import Template from "./Menus/Template";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AddToPhotosIcon from "@mui/icons-material/AddToPhotos";
import Profile from "./Menus/Profiles";

const AppBar = () => {
  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "white", // Black background
        overflowX: "auto",
        borderBottom: "1px solid #D3D3D3", // Thêm dòng kẻ dưới
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <AppsIcon
          sx={{
            color: "black",
            fontSize: "24px",
            "&:hover": {
              backgroundColor: "#F7F8F9", // Optional: light hover effect
            },
          }}
        />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            "&:hover": {
              backgroundColor: "#F7F8F9", // Optional: light hover effect
            },
          }}
        >
          <SvgIcon
            component={trelloLogo}
            inheritViewBox
            fontSize="24px"
            sx={{
              color: "black",
            }} // Change the logo color to white
          />
          <Typography
            variant="span"
            sx={{
              fontWeight: "bold",
              color: "black", // Change text to white
              fontSize: "18px",
            }}
          >
            Pro Manage
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          {/* Ensure text color for menu items is set to white */}
          <Workspace />
          <Recent />
          <Started />
          <Template />

          <Button
            variant="contained"
            startIcon={<AddToPhotosIcon />}
            sx={{
              color: "white", // Change button text color to black
              backgroundColor: "#0055CC", // Change background to white
              fontSize: "0.75rem",
              textTransform: "none",
              paddingX: "12px",
              paddingY: "0px",
            }}
          >
            Create
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          marginLeft: "auto",
        }}
      >
        <TextField
          id="outlined-search"
          label="Search..."
          type="search"
          size="small"
          InputProps={{
            sx: { height: 35, width: 210, color: "black" }, // Change text color in the input field
          }}
        />
        <Tooltip title="Notification">
          <Badge badgeContent={2} color="error" sx={{ cursor: "pointer" }}>
            <NotificationsNoneIcon
              sx={{ fontSize: "medium", color: "black" }} // Notification icon color black
            />
          </Badge>
        </Tooltip>
        <Tooltip title="Help">
          <HelpOutlineIcon
            sx={{
              fontSize: "medium",
              cursor: "pointer",
              color: "black", // Help icon color black
            }}
          />
        </Tooltip>
        <Profile sx={{ color: "black" }} /> {/* Profile icon color black */}
      </Box>
    </Box>
  );
};

export default AppBar;
