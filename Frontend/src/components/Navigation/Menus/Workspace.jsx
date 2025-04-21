import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useGetGuestWorkspaces, useGetWorkspaces } from "../../../hooks/useWorkspace";
import { useRecentBoardAccess, useRecentBoards } from "../../../hooks/useBoard";
import { useNavigate } from "react-router-dom";
import { useGuestBoards } from "../../../hooks/useInviteBoard";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    transformOrigin={{ vertical: "top", horizontal: "center" }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 250,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
  },
}));

const WorkspaceItem = React.memo(({ workspace, onClose, isGuest = false }) => {
  const navigate = useNavigate();

  // const { data: guestBoards } = useGuestBoards();

  // const handleWorkspaceClick = () => {
  //   console.log(guestBoards);

  //   if (isGuest) {
  //     // Lấy danh sách bảng trong workspace khách
  //     const guestBoardsList =
  //       guestBoards?.find((ws) => ws.workspace_id === workspace.id)?.boards || [];

  //     if (guestBoardsList.length > 0) {
  //       // Sắp xếp theo bảng được truy cập gần nhất
  //       const latestBoard = guestBoardsList[0];
  //       navigate(`/b/${latestBoard.id}/${latestBoard.name}`);
  //     }
  //   } else {
  //     // Điều hướng đến trang home nếu là workspace của mình
  //     navigate(`/w/${workspace.name}/home`);
  //   }
  //   onClose();
  // };

  return (
    <MenuItem
      onClick={handleWorkspaceClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        "&:hover": { bgcolor: "#F4F5F7" },
      }}
    >
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          bgcolor: isGuest ? "#EB5A47" : "#0079BF",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          fontSize: "1rem",
          flexShrink: 0,
        }}
      >
        {workspace.name?.charAt(0).toUpperCase()}
      </Box>
      <Typography variant="body2" sx={{ fontWeight: 500, color: "#172B4D" }}>
        {workspace.name}
      </Typography>
    </MenuItem>
  );
});


const Workspace = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  // const { data: workspaces, isLoading, isError } = useGetWorkspaces();
  // const { data: guestWorkspace } = useGetGuestWorkspaces();
  // console.log(guestWorkspace);

  // console.log(guestWorkspace);


  // // Gom nhóm danh sách không gian làm việc khách (chỉ lấy unique workspace)
  // const groupedGuestWorkspaces = useMemo(() => {
  //   if (!guestWorkspace?.data) return [];

  //   return guestWorkspace.data.map((infor) => ({
  //     id: infor.id, // Tạo ID tạm
  //     name: infor.name,
  //   }));
  // }, [guestWorkspace?.data]);

  return (
    <Box>
      <Button
        id="workspace-button"
        aria-controls={open ? "workspace-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "secondary.contrastText" }}
      >
        Không gian làm việc
      </Button>
      <StyledMenu
        id="workspace-menu"
        MenuListProps={{ "aria-labelledby": "workspace-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* Hiển thị không gian làm việc của người dùng */}
        <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, color: "#172B4D" }}>
          Không gian của tôi
        </Typography>
        <Divider />
        {/* {isLoading && (
          <MenuItem>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
          </MenuItem>
        )} */}
        {/* {isError && <MenuItem sx={{ color: "red" }}>Lỗi tải dữ liệu</MenuItem>}
        {workspaces?.map((workspace) => (
          <WorkspaceItem key={workspace.id} workspace={workspace} onClose={handleClose} />
        ))} */}

        {/* Hiển thị không gian làm việc khách */}
        {/* {groupedGuestWorkspaces.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, color: "#172B4D" }}>
              Không gian làm việc khách
            </Typography>
            <Divider />
            {groupedGuestWorkspaces.map((workspace) => (
              <WorkspaceItem key={workspace.id} workspace={workspace} onClose={handleClose} isGuest />
            ))}
          </>
        )} */}
      </StyledMenu>
    </Box>
  );
};

export default Workspace;
