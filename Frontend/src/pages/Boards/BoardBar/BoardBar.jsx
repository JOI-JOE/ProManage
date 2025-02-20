import React, { useState } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import BoltIcon from "@mui/icons-material/Bolt";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AutomationDialog from "./childComponent/Auto/Auto";
import FilterDialog from "./childComponent/Filter/Filter";
import ViewPermissionsDialog from "./childComponent/View/View";
import ShareBoardDialog from "./childComponent/Share/Share";
import Right from "../Right";

const style = {
  border: "none",
  fontWeight: "bold",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#ffffff",
  ":hover": { backgroundColor: "" },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
    color: "#ffffff",
  },
};

const BoardBar = ({ board }) => {
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const handleFilterDialogOpen = () => setOpenFilterDialog(true);
  const handleFilterDialogClose = () => setOpenFilterDialog(false);

  const [openAutomationDialog, setOpenAutomationDialog] = useState(false);
  const handleAutomationDialogOpen = () => setOpenAutomationDialog(true);
  const handleAutomationDialogClose = () => setOpenAutomationDialog(false);

  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] =
    useState(false);
  const handleViewPermissionsDialogOpen = () =>
    setOpenViewPermissionsDialog(true);
  const handleViewPermissionsDialogClose = () =>
    setOpenViewPermissionsDialog(false);

  const [openShareDialog, setOpenShareDialog] = useState(false);
  const [editTitle, setEditTitle] = useState(false);
  const [teamName, setTeamName] = useState(board?.title || "Team WD-51");

  const handleTitleClick = () => setEditTitle(true);

  const handleTitleChange = (e) => setTeamName(e.target.value);

  const handleTitleBlur = () => setEditTitle(false);

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      setEditTitle(false);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        borderBottom: "2px solid #808e9b",
        justifyContent: "space-between",
        gap: 2,
        overflowX: "auto",
      }}
    >
      <Box px={1} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/*Chỉnh sửa tiêu đề  */}
        {editTitle ? (
          <TextField
            value={teamName}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress} //sự kiện onKeyPress
            variant="outlined"
            size="small"
            sx={{
              width: "80px",
              height: "30px",
              "& .MuiInputBase-root": {
                fontSize: "0.7rem", // Kích thước chữ khi nhập
                backgroundColor: "#2E4053",
              },
              "& .MuiInputBase-input": {
                textAlign: "center",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              },
            }}
          />
        ) : (
          <Chip label={teamName} sx={style} onClick={handleTitleClick} />
        )}
        <Chip
          icon={<LockOpenIcon />}
          label="Khả năng xem"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleViewPermissionsDialogOpen}
        />
        <Chip
          icon={<BoltIcon />}
          label="Tự động hóa"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleAutomationDialogOpen}
        />
        <Chip
          icon={<FilterListIcon />}
          label="Lọc bảng"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleFilterDialogOpen}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", paddingX: 2 }}>
        <AvatarGroup
          max={5}
          sx={{
            paddingX: "8px",
            "& .MuiAvatar-root": {
              height: "30px",
              width: "30px",
              fontSize: "16px",
            },
          }}
        >
          <Tooltip title="Người dùng">
            <Avatar src="https://via.placeholder.com/40" />
          </Tooltip>
        </AvatarGroup>
        <Button
          variant="contained"
          startIcon={<PersonAddAltIcon />}
          sx={{
            color: "white",
            backgroundColor: "primary.dark",
            fontSize: "0.75rem",
            textTransform: "none",
          }}
          onClick={() => setOpenShareDialog(true)}
        >
          Chia sẻ
        </Button>
        <Right />
      </Box>

      {/* Hộp thoại chia sẻ */}
      <ShareBoardDialog
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
      />

      {/* Hộp thoại lọc */}
      <FilterDialog open={openFilterDialog} onClose={handleFilterDialogClose} />

      {/* Hộp thoại tự động hóa */}
      <AutomationDialog
        open={openAutomationDialog}
        onClose={handleAutomationDialogClose}
      />

      {/* Hộp thoại quyền xem */}
      <ViewPermissionsDialog
        open={openViewPermissionsDialog}
        onClose={handleViewPermissionsDialogClose}
      />
    </Box>
  );
};

export default BoardBar;
