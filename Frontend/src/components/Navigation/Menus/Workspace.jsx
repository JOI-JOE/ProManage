import { Box, CircularProgress, Typography, ListItemIcon } from "@mui/material";
import React, { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router-dom";
import { useWorkspace } from "../../../contexts/WorkspaceContext";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import DashboardIcon from "@mui/icons-material/Dashboard";
import AddIcon from "@mui/icons-material/Add";

const StyledMenu = styled(Menu)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    width: 300,
    color: theme.palette.mode === "dark" ? theme.palette.grey[300] : "rgb(55, 65, 81)",
    boxShadow: theme.shadows[3],
    "& .MuiMenu-list": { padding: "4px 0" },
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
      "&:hover": { bgcolor: "action.hover" },
    }}
  >
    <Box
      sx={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        bgcolor: isGuest ? "error.main" : "primary.main",
        color: "white",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2,
        py: 1,
        "&:hover": { bgcolor: "#F4F5F7" },
      }}
    >
      {(isGuest ? workspace.workspaceName : workspace.display_name)?.charAt(0)?.toUpperCase()}
    </Box>
    <Typography variant="body2" sx={{ fontWeight: 500 }}>
      {isGuest ? workspace.workspaceName : workspace.display_name}
    </Typography>
  </MenuItem>
));

const Workspace = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { data, guestWorkspace, isLoading, error } = useWorkspace();
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const guestBoards = useMemo(() => {
    return guestWorkspace?.flatMap(workspace =>
      workspace.boards?.map(board => ({
        id: board.id,
        name: board.name,
        workspaceId: board.workspace_id,
        workspaceName: workspace.display_name
      })) || []
    ) || [];
  }, [guestWorkspace]);

  return (
    <Box>
      <Button
        id="workspace-menu-button"
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
        MenuListProps={{ "aria-labelledby": "workspace-menu-button" }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {/* Header Section */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", px: 2, py: 1 }}>
          CÁC KHÔNG GIAN LÀM VIỆC
        </Typography>

        <Divider sx={{ my: 1 }} />

        {/* Workspaces List */}
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
          </MenuItem>
        ) : error ? (
          <MenuItem disabled sx={{ color: "error.main" }}>
            Lỗi tải dữ liệu
          </MenuItem>
        ) : (
          data?.workspaces?.map(workspace => (
            <WorkspaceItem key={workspace.id} workspace={workspace} onClose={handleClose} />
          ))
        )}

        <Divider sx={{ my: 1 }} />

        {/* Guest Workspaces */}
        <Typography variant="subtitle1" sx={{ fontWeight: "bold", px: 2, py: 1 }}>
          CÁC KHÔNG GIAN LÀM VIỆC KHÁCH
        </Typography>

        {guestBoards.length > 0 ? (
          guestBoards.map(board => (
            <WorkspaceItem key={board.id} workspace={board} onClose={handleClose} isGuest />
          ))
        ) : (
          <MenuItem disabled sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
            <Typography variant="body2">0 bảng còn lại</Typography>
            <Typography variant="caption">Nhận các bảng không giới hạn</Typography>
          </MenuItem>
        )}
      </StyledMenu>
    </Box>
  );
};

export default React.memo(Workspace);
