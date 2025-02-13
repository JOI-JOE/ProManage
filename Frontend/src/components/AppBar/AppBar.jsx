// import React from 'react'

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
import { Link } from "react-router-dom";
import { useState } from "react";

const AppBar = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <Box
      px={2}
      sx={{
        width: "100%",
        height: (theme) => theme.trello.appBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "secondary.main",
        overflowX: "auto",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <AppsIcon sx={{ color: "secondary.contrastText", fontSize: "24px" }} />
        <Box
          component={Link}
          to="/"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <SvgIcon
            component={trelloLogo}
            inheritViewBox
            fontSize="24px"
            sx={{ color: "secondary.contrastText" }}
          />
          <Typography
            variant="span"
            sx={{
              fontWeight: "bold",
              color: "secondary.contrastText",
              fontSize: "18px",
            }}
          >
            Pro Manage
          </Typography>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2 }}>
          <Workspace />
          <Recent />
          <Started />
          <Template />

          <Button
            variant="contained"
            startIcon={<AddToPhotosIcon />}
            sx={{
              color: "white",
              backgroundColor: "primary.dark",
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
          autoComplete="off"
          id="outlined-search"
          label="Search..."
          type="search"
          size="small"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          InputLabelProps={{
            sx: { fontSize: "14px", color: "white" }, // Giảm kích thước chữ label
          }}
          InputProps={{
            sx: {
              height: 35,
              width: 210,
              backgroundColor: "black",
              borderRadius: "8px",
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
              },

              "& .MuiInputBase-input": {
                // color: "white",
                fontSize: "13px",
                // padding: "4px 8px",
              },
            },
            // endAdornment: searchText && (
            //   <InputAdornment position="end">
            //     <IconButton
            //       size="small"
            //       onClick={() => setSearchText("")}
            //       sx={{ color: "white" }}
            //     >
            //       <CloseIcon />
            //     </IconButton>
            //   </InputAdornment>
            // ),
          }}
        />

        <Tooltip title="Notification">
          <Badge badgeContent={2} color="error" sx={{ cursor: "pointer" }}>
            <NotificationsNoneIcon
              sx={{ fontSize: "medium", color: "secondary.contrastText" }}
            />
          </Badge>
        </Tooltip>

        <Tooltip title="Help">
          <HelpOutlineIcon
            sx={{
              fontSize: "medium",
              cursor: "pointer",
              color: "secondary.contrastText",
            }}
          />
        </Tooltip>
        <Profile />
      </Box>
    </Box>
  );
};

export default AppBar;
