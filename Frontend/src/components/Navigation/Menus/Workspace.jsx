import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useGetGuestWorkspaces, useGetWorkspaces } from "../../../hooks/useWorkspace";
import { Link } from "react-router-dom";

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
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
    "& .MuiMenu-list": { padding: "4px 0" },
    "& .MuiMenuItem-root": {
      "& .MuiSvgIcon-root": { fontSize: 18, color: "#000", marginRight: theme.spacing(1.5) },
    },
    ...theme.applyStyles("dark", { color: theme.palette.grey[300] }),
  },
}));

const WorkspaceItem = React.memo(({ workspace, onClose, isGuest = false }) => (
  <MenuItem
    component={Link}
    to={isGuest ? `/b/${workspace.id}/${workspace.name}` : `/w/${workspace.name}/home`}
    onClick={onClose}
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
      {(isGuest ? workspace.workspaceName : workspace.display_name).charAt(0).toUpperCase()}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 500, color: "#172B4D" }}>
      {isGuest ? workspace.workspaceName : workspace.display_name}
    </Typography>
  </MenuItem>
));

const Workspace = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const { data: data, isLoading, isError } = useGetWorkspaces();
  // const { data: guestWorkspace } = useGetGuestWorkspaces();

  // const InviteBoard = useMemo(() => {
  //   return guestWorkspace?.data?.flatMap((workspaceGuest) =>
  //     workspaceGuest.boards.map((board) => ({
  //       id: board.id,
  //       name: board.name,
  //       workspaceId: board.workspace_id,
  //       workspaceName: workspaceGuest.display_name
  //     }))
  //   ) || [];
  // }, [guestWorkspace?.data]);

  return (
    <Box>
      <Button
        id="demo-customized-button-workspace"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "secondary.contrastText" }}
      >
        Các Không gian làm việc
      </Button>
      <StyledMenu
        id="demo-customized-menu-workspace"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{ minWidth: 250 }}
      >
        <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, color: "#172B4D" }}>
          Các không gian làm việc
        </Typography>
        <Divider />
        {/* {isLoading && (
          <MenuItem>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
          </MenuItem>
        )} */}
        {/* {isError && <MenuItem sx={{ color: "red" }}>Lỗi tải dữ liệu</MenuItem>} */}
        {/* {workspaces?.map((workspace) => (
          <WorkspaceItem key={workspace.id} workspace={workspace} onClose={handleClose} />
        ))} */}
        <Divider sx={{ my: 1 }} />
        <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, color: "#172B4D" }}>
          Không gian làm việc khách
        </Typography>
        <Divider />
        {/* {InviteBoard?.map((board) => (
          <WorkspaceItem key={board.id} workspace={board} onClose={handleClose} isGuest />
        ))} */}
      </StyledMenu>
    </Box>
  );
};

export default Workspace;