import { Box } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import Divider from "@mui/material/Divider";
import ArchiveIcon from "@mui/icons-material/Archive";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useRecentBoards } from "../../../hooks/useBoard";
import { Link } from "react-router-dom";


const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": {
      padding: "4px 0",
    },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": {
        fontSize: 18,
        color: "#000",
        marginRight: theme.spacing(1.5),
      },
      "&:active": {},
    },
    ...theme.applyStyles("dark", {
      color: theme.palette.grey[300],
    }),
  },
}));

const Recent = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // Lấy dữ liệu từ useRecentBoards hook
  const { data: recentBoards, isLoading, error } = useRecentBoards();

  if (isLoading) {
    return <Box>Loading...</Box>;
  }

  if (error) {
    return <Box>Error loading recent boards</Box>;
  }

  return (
    <Box>
      <Button
        id="demo-customized-button-workspace"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        // variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "secondary.contrastText" }}
      >
        Recent
      </Button>
      <StyledMenu
        id="demo-customized-menu-workspace"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {recentBoards?.data?.map((board) => (
          <MenuItem
            key={board.id}
            component={Link}
          to={`/b/${board.board_id}/${board.board_name}`}
            onClick={handleClose}
            disableRipple
            sx={{
              fontSize: "0.87rem",
              color: "secondary.main",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              padding: "8px 200px 10px 10px ",
            }}
          >
            {/* Hiển thị thumbnail của board */}
            <img
              src={board.thumbnail} // Hiển thị thumbnail của board
              alt={board.board_name}
              style={{
                width: 40,
                height: 40,
                marginBottom: 8,
                borderRadius: "50%",
                objectFit: "cover",
              }}
            />
            <Box sx={{ fontSize: "0.9rem", fontWeight: "bold" }}>
              {board.workspace_display_name} {/* Tên workspace */}
            </Box>
            <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
              {board.board_name} {/* Tên bảng */}
            </Box>
          </MenuItem>
        ))}
      </StyledMenu>
    </Box>
  );
};

export default Recent;
