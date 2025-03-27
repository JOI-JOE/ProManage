import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  ListItem,
  Button,
  Popover,
  TextField,
  Select,
  MenuItem,
  Grid,
  IconButton,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateBoard, useImageUnsplash } from "../hooks/useBoard";
import { useColor } from "../hooks/useColor";
import { useWorkspace } from "../contexts/WorkspaceContext";

const CreateBoard = ({ workspaceId }) => {
  const { mutate: createBoard, isLoading: isCreatingBoard } = useCreateBoard();
  const {
    data: unsplashImages,
    isLoading: unsplashingImages,
    refetch,
  } = useImageUnsplash();

  const { data: workspaceData } = useWorkspace();
  const filterWorkspace = useMemo(() =>
    workspaceData?.workspaces?.map(({ display_name, name, id }) => ({
      display_name,
      name,
      id
    })) || [],
    [workspaceData]
  );
  const { data: colors, isLoading: isLoadingColors } = useColor();

  const [openPopover, setOpenPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [viewPermission, setViewPermission] = useState("workspace");

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
    refetch();
  };

  const handleClose = () => {
    setOpenPopover(false);
    setAnchorEl(null);
    setBoardTitle(""); // Reset form khi đóng
    setSelectedBg("");
    setWorkspace("");
    setViewPermission("workspace");
  };

  const handleSelectBg = useCallback((bg) => {
    setSelectedBg(bg);
  }, []);

  const handleCreateBoard = useCallback(() => {
    if (!boardTitle.trim()) {
      alert("Vui lòng nhập tiêu đề bảng!");
      return;
    }

    const boardData = {
      name: boardTitle,
      thumbnail: selectedBg,
      workspace_id: workspace || filterWorkspace[0]?.id, // Default to first workspace if none selected
      visibility: viewPermission,
    };

    createBoard(boardData, {
      onSuccess: () => {
        alert(`🎉 Bảng "${boardTitle}" đã được tạo thành công!`);
        handleClose();
      },
      onError: (error) => {
        alert(`❌ Lỗi khi tạo bảng: ${error.message}`);
      },
    });
  }, [boardTitle, selectedBg, workspace, viewPermission, createBoard, filterWorkspace]);

  return (
    <div>
      <ListItem sx={{ width: "auto", padding: 0 }}>
        <Box
          onClick={handleOpen}
          sx={{
            width: "180px",
            height: "100px",
            backgroundColor: "#EDEBFC",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": { backgroundColor: "#DCDFE4" },
          }}
        >
          Tạo bảng mới
        </Box>
      </ListItem>

      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableEnforceFocus
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight="bold">
              Tạo bảng
            </Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: "100px",
              background: selectedBg.startsWith("#")
                ? selectedBg
                : `url(${selectedBg}) center/cover no-repeat`,
              borderRadius: "8px",
              mb: 2,
            }}
          />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Phông nền
          </Typography>


          <Grid container spacing={1} sx={{ mb: 2 }}>
            {colors?.map((color) => (
              <Grid item key={color.id}>
                <Box
                  sx={{
                    width: 50,
                    height: 35,
                    backgroundColor: color.hex_code,
                    borderRadius: "4px",
                    cursor: "pointer",
                    border: selectedBg === color.hex_code ? "2px solid #007BFF" : "none",
                  }}
                  onClick={() => handleSelectBg(color.hex_code)}
                />
              </Grid>
            ))}
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Ảnh từ Unsplash
          </Typography>

          {unsplashingImages ? (
            <Typography>Đang tải ảnh...</Typography>
          ) : (
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {unsplashImages?.map((image) => (
                <Grid item key={image.id}>
                  <Box
                    component="img"
                    src={image.urls.small}
                    sx={{
                      width: 50,
                      height: 35,
                      borderRadius: "4px",
                      cursor: "pointer",
                      border: selectedBg === image.urls.small ? "2px solid #007BFF" : "none",
                    }}
                    onClick={() => handleSelectBg(image.urls.small)}
                  />
                </Grid>
              ))}
            </Grid>
          )}

          <TextField
            fullWidth
            label="Tiêu đề bảng"
            variant="outlined"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            error={!boardTitle.trim()}
            helperText={!boardTitle.trim() && "👋Tiêu đề bảng là bắt buộc"}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Không gian làm việc
          </Typography>
          <Select
            fullWidth
            value={workspace || workspaceId || filterWorkspace[0]?.id || ""} // Đảm bảo value khớp với ws.id
            onChange={(e) => setWorkspace(e.target.value)}
            sx={{
              mb: 2,
              color: "black",
              "& .MuiSvgIcon-root": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
            }}
          >
            {filterWorkspace.map((ws) => (
              <MenuItem key={ws.id} value={ws.id}>
                {ws.display_name || ws.name}
              </MenuItem>
            ))}
          </Select>

          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            Quyền xem
          </Typography>
          <Select
            fullWidth
            value={viewPermission}
            onChange={(e) => setViewPermission(e.target.value)}
            sx={{ mb: 2 }}
          >
            <MenuItem value="private">
              <LockIcon sx={{ mr: 1 }} fontSize="small" />
              Riêng tư
            </MenuItem>
            <MenuItem value="workspace">
              <GroupsIcon sx={{ mr: 1 }} fontSize="small" />
              Không gian làm việc
            </MenuItem>
            <MenuItem value="public">
              <PublicIcon sx={{ mr: 1 }} fontSize="small" />
              Công khai
            </MenuItem>
          </Select>

          <Button
            fullWidth
            variant="contained"
            onClick={handleCreateBoard}
            disabled={isCreatingBoard || !boardTitle.trim()}
          >
            {isCreatingBoard ? "Đang tạo..." : "Tạo bảng"}
          </Button>
        </Box>
      </Popover>
    </div>
  );
}

export default CreateBoard;