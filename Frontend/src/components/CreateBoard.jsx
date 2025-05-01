import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  TextField,
  Select,
  MenuItem,
  Grid,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GroupsIcon from "@mui/icons-material/Groups";
import PublicIcon from "@mui/icons-material/Public";
import CloseIcon from "@mui/icons-material/Close";
import { useCreateBoard, useImageUnsplash, useRecentBoardAccess, useUpdateBoardLastAccessed } from "../hooks/useBoard";
import { useColor } from "../hooks/useColor";
import { useWorkspace } from "../contexts/WorkspaceContext";
import LogoLoading from "./Common/LogoLoading";
import { useNavigate } from "react-router-dom";

const CreateBoard = ({ workspaceId, open, anchorEl, onClose, onOpen }) => {
  const navigate = useNavigate()
  const { mutate: createBoard, isLoading: isCreatingBoard } = useCreateBoard();
  const saveRecentBoard = useRecentBoardAccess();
  const updateAccessTime = useUpdateBoardLastAccessed();
  const {
    data: unsplashImages,
    isLoading: unsplashingImages,
    refetch,
  } = useImageUnsplash();
  const { workspaces } = useWorkspace();
  const { data: colors, isLoading: isLoadingColors } = useColor();

  const filterWorkspace = useMemo(
    () =>
      workspaces?.map(({ display_name, name, id }) => ({
        display_name,
        name,
        id,
      })) || [],
    [workspaces]
  );

  // Initialize states
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [viewPermission, setViewPermission] = useState("workspace");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default workspace
  useEffect(() => {
    if (workspaceId) {
      setWorkspace(workspaceId);
    } else if (filterWorkspace.length > 0) {
      setWorkspace(filterWorkspace[0].id);
    }
  }, [workspaceId, filterWorkspace]);

  // Set default background: prefer Unsplash, fallback to first color
  useEffect(() => {
    if (!selectedBg) {
      if (unsplashImages?.length > 0) {
        setSelectedBg(unsplashImages[0].urls.small);
      } else if (colors?.length > 0) {
        setSelectedBg(colors[0].hex_code);
      }
    }
  }, [unsplashImages, colors, selectedBg]);

  // Handle Snackbar close
  const handleSnackbarClose = useCallback(() => {
    setSnackbar({ open: false, message: "", severity: "success" });
  }, []);

  // Handle popover open

  const handleClickBoard = (boardId) => {
    saveRecentBoard.mutate(boardId); // Lưu vào recent-board
    updateAccessTime.mutate(boardId); // Cập nhật thời gian truy cập
  };
  // Khi popover mở, gọi refetch để tải ảnh Unsplash
  const handleOpen = useCallback(
    (event) => {
      if (onOpen) onOpen(event);
      refetch();
    },
    [onOpen, refetch]
  );

  // Reset form and close popover
  const handleClose = useCallback(() => {
    if (isSubmitting || isCreatingBoard) return;

    setBoardTitle("");
    setSelectedBg(unsplashImages?.[0]?.urls.small || colors?.[0]?.hex_code || "");
    setWorkspace(workspaceId || filterWorkspace[0]?.id || "");
    setViewPermission("workspace");
    onClose();
  }, [onClose, workspaceId, filterWorkspace, unsplashImages, colors, isSubmitting, isCreatingBoard]);

  const handleSelectBg = useCallback((bg) => {
    setSelectedBg(bg);
  }, []);

  const handleCreateBoard = useCallback(() => {
    if (!boardTitle.trim()) {
      setSnackbar({
        open: true,
        message: "Tiêu đề bảng không được để trống!",
        severity: "error",
      });
      return;
    }

    if (!selectedBg) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn phông nền cho bảng!",
        severity: "error",
      });
      return;
    }

    if (!workspace) {
      setSnackbar({
        open: true,
        message: "Vui lòng chọn không gian làm việc!",
        severity: "error",
      });
      return;
    }

    setIsSubmitting(true);

    const boardData = {
      name: boardTitle,
      thumbnail: selectedBg,
      workspace_id: workspace,
      visibility: viewPermission,
    };

    createBoard(boardData, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: `Bảng "${boardTitle}" đã được tạo thành công!️ 🎉`,
          severity: "success",
        });
        // Reset form
        setBoardTitle("");
        setSelectedBg(unsplashImages?.[0]?.urls.small || colors?.[0]?.hex_code || "");
        setWorkspace(workspaceId || filterWorkspace[0]?.id || "");
        setViewPermission("workspace");
        setIsSubmitting(false);
        onClose();
      },
      onError: (error) => {
        setSnackbar({
          open: true,
          message: `Lỗi khi tạo bảng: ${error.message || "Vui lòng thử lại."}`,
          severity: "error",
        });
        setIsSubmitting(false);
      },
    });

  }, [
    boardTitle,
    selectedBg,
    workspace,
    viewPermission,
    createBoard,
    workspaceId,
    filterWorkspace,
    unsplashImages,
    colors,
    onClose,
  ]);

  const isButtonDisabled = isCreatingBoard || isSubmitting || !boardTitle.trim() || !selectedBg || !workspace;

  return (
    <>
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
        // Prevent closing when submitting
        disableRestoreFocus={isSubmitting || isCreatingBoard}
      >
        <Box sx={{ width: 320, p: 2, bgcolor: "background.paper" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Tạo bảng
            </Typography>
            <IconButton
              onClick={handleClose}
              size="small"
              disabled={isSubmitting || isCreatingBoard}
              sx={{
                borderRadius: "4px",
                "&:hover": { backgroundColor: "grey.100" },
              }}
            >
              <CloseIcon sx={{ fontSize: "20px", color: "grey.600" }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              width: "100%",
              height: 80,
              background: selectedBg.startsWith("#")
                ? selectedBg
                : `url(${selectedBg}) center/cover no-repeat`,
              borderRadius: "8px",
              mb: 1.5,
              border: selectedBg ? "none" : "1px dashed #e0e0e0",
            }}
          />
          {/* 
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Phông nền
          </Typography>

          {colors?.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {colors.map((color) => (
                <Grid item key={color.id}>
                  <Box
                    sx={{
                      width: 40,
                      height: 30,
                      backgroundColor: color.hex_code,
                      borderRadius: "4px",
                      cursor: isSubmitting || isCreatingBoard ? "default" : "pointer",
                      border:
                        selectedBg === color.hex_code
                          ? "2px solid #007BFF"
                          : "1px solid #e0e0e0",
                      opacity: isSubmitting || isCreatingBoard ? 0.7 : 1,
                      pointerEvents: isSubmitting || isCreatingBoard ? "none" : "auto",
                    }}
                    onClick={() => handleSelectBg(color.hex_code)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
              Không có màu sắc nào khả dụng
            </Typography>
          )} */}

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Ảnh từ Unsplash
          </Typography>

          {unsplashingImages ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
              <CircularProgress size={24} />
            </Box>
          ) : unsplashImages?.length > 0 ? (
            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              {unsplashImages.map((image) => (
                <Grid item key={image.id}>
                  <Box
                    component="img"
                    src={image.urls.small}
                    sx={{
                      width: 40,
                      height: 30,
                      borderRadius: "4px",
                      cursor: isSubmitting || isCreatingBoard ? "default" : "pointer",
                      border:
                        selectedBg === image.urls.small
                          ? "2px solid #007BFF"
                          : "1px solid #e0e0e0",
                      opacity: isSubmitting || isCreatingBoard ? 0.7 : 1,
                      pointerEvents: isSubmitting || isCreatingBoard ? "none" : "auto",
                    }}
                    onClick={() => handleSelectBg(image.urls.small)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5 }}>
              Không có ảnh Unsplash nào khả dụng
            </Typography>
          )}

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Tiêu đề bảng{" "}
            <Typography component="span" sx={{ color: "red" }}>
              *
            </Typography>
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            error={!boardTitle.trim()}
            helperText={!boardTitle.trim() && "👋 Tiêu đề bảng là bắt buộc"}
            sx={{ mb: 1.5 }}
            disabled={isSubmitting || isCreatingBoard}
          />

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Không gian làm việc
          </Typography>
          <Select
            fullWidth
            size="small"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            sx={{ mb: 1.5 }}
            disabled={filterWorkspace.length === 0 || isSubmitting || isCreatingBoard}
          >
            {filterWorkspace.length > 0 ? (
              filterWorkspace.map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.display_name || ws.name}
                </MenuItem>
              ))
            ) : (
              <MenuItem value="" disabled>
                Không có không gian làm việc
              </MenuItem>
            )}
          </Select>

          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            Quyền xem
          </Typography>
          <Select
            fullWidth
            size="small"
            value={viewPermission}
            onChange={(e) => setViewPermission(e.target.value)}
            sx={{ mb: 1.5 }}
            disabled={isSubmitting || isCreatingBoard}
          >
            <MenuItem value="private">
              <LockIcon sx={{ mr: 1, fontSize: "small" }} />
              Riêng tư
            </MenuItem>
            <MenuItem value="workspace">
              <GroupsIcon sx={{ mr: 1, fontSize: "small" }} />
              Không gian làm việc
            </MenuItem>
            <MenuItem value="public">
              <PublicIcon sx={{ mr: 1, fontSize: "small" }} />
              Công khai
            </MenuItem>
          </Select>

          <Button
            fullWidth
            variant="contained"
            onClick={handleCreateBoard}
            disabled={isButtonDisabled}
            sx={{
              height: 36,
              fontSize: "0.875rem",
              position: "relative"
            }}
          >
            {(isCreatingBoard || isSubmitting) ? (
              <LogoLoading scale={0.4} />
            ) : (
              "Tạo bảng"
            )}
          </Button>
        </Box>
      </Popover>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default CreateBoard;