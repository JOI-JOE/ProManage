import { Box, CircularProgress, Typography } from "@mui/material";
import React, { useState, useMemo } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "../../../contexts/WorkspaceContext";
import WorkspaceAvatar from "../../Common/WorkspaceAvatar";

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


const Workspace = () => {
  const { workspaces, guestWorkspaces, isLoading } = useWorkspace()

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const navigate = useNavigate();

  const handleRedirectToLastActiveBoard = (workspace) => {
    const boards = workspace?.boards?.filter((b) => !b.closed);
    if (!boards?.length) return;

    const mostRecentBoard = boards.reduce((latest, current) => {
      return new Date(current.last_accessed) > new Date(latest.last_accessed) ? current : latest;
    });

    navigate(`/b/${mostRecentBoard?.id}/${mostRecentBoard?.name}`);
  };

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
        {/* Section for user's workspaces */}
        <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, color: "#172B4D" }}>
          Các Không gian làm việc của bạn
        </Typography>

        {workspaces?.map((workspace) => (
          <Box
            key={workspace.id}
            onClick={() => navigate(`/w/${workspace.id}`)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2,
              py: 1,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#F4F5F7",
              },
            }}
          >
            <WorkspaceAvatar workspace={workspace} />
            <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
              {workspace?.display_name}
            </Typography>
          </Box>
        ))}

        <Divider />
        {/* Guest workspaces section */}
        <Typography variant="body1" sx={{ fontWeight: "bold", px: 2, py: 1, mt: 1, color: "#172B4D" }}>
          Các Không gian làm việc khách
        </Typography>

        {guestWorkspaces?.map((workspace) => (
          <Box
            key={workspace.id}
            onClick={() => handleRedirectToLastActiveBoard(workspace)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: 2,
              py: 1,
              cursor: "pointer",
              borderRadius: 1,
              "&:hover": {
                backgroundColor: "#F4F5F7",
              },
            }}
          >
            <WorkspaceAvatar workspace={workspace} />
            <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
              {workspace?.display_name}
            </Typography>
          </Box>
        ))}
      </StyledMenu>
    </Box>
  );
};

export default Workspace;
