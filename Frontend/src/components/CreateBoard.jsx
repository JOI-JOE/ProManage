import React, { useCallback, useMemo, useState } from "react";
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

const CreateBoard = ({ workspaceId, open, anchorEl, onClose, onOpen }) => {
  const { mutate: createBoard, isLoading: isCreatingBoard } = useCreateBoard();
  const {
    data: unsplashImages,
    isLoading: unsplashingImages,
    refetch,
  } = useImageUnsplash();

  const { workspaces } = useWorkspace();
  const filterWorkspace = useMemo(
    () =>
      workspaces?.map(({ display_name, name, id }) => ({
        display_name,
        name,
        id,
      })) || [],
    [workspaces]
  );

  console.log(filterWorkspace[0]?.id)
  const { data: colors, isLoading: isLoadingColors } = useColor();

  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [workspace, setWorkspace] = useState(workspaceId || filterWorkspace[0]?.id || ""); // Initialize with workspaceId or first workspace
  const [viewPermission, setViewPermission] = useState("workspace");

  // Khi popover mở, gọi refetch để tải ảnh Unsplash
  const handleOpen = useCallback(
    (event) => {
      if (onOpen) onOpen(event); // Gọi hàm mở từ parent nếu có
      refetch();
    },
    [onOpen, refetch]
  );

  // Reset form và đóng popover
  const handleClose = useCallback(() => {
    setBoardTitle("");
    setSelectedBg("");
    setWorkspace(workspaceId || filterWorkspace[0]?.id || ""); // Reset to initial workspace
    setViewPermission("workspace");
    onClose(); // Gọi hàm đóng từ parent
  }, [onClose, workspaceId, filterWorkspace]);

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
      workspace_id: workspace, // Use the selected workspace state
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
  }, [
    boardTitle,
    selectedBg,
    workspace, // Use the selected workspace
    viewPermission,
    createBoard,
    handleClose,
  ]);

  return (
    <>
      {/* Popover hiển thị form tạo board */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        disableEnforceFocus
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        sx={{ m: 2 }}
      >
        <Box sx={{ width: 350, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Tạo bảng
            </Typography>
            <IconButton
              onClick={handleClose}
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
                    border:
                      selectedBg === color.hex_code
                        ? "2px solid #007BFF"
                        : "none",
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
                      border:
                        selectedBg === image.urls.small
                          ? "2px solid #007BFF"
                          : "none",
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
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            sx={{
              mb: 2,
              color: "black",
              "& .MuiSvgIcon-root": { color: "white" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "#666",
              },
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
    </>
  );
};

export default CreateBoard;