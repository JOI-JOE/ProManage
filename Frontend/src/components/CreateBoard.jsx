import React, { useMemo, useState } from "react";
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
import { useGetWorkspaces } from "../hooks/useWorkspace";
import { useColor } from "../hooks/useColor";

// const colors = ["#E3F2FD", "#64B5F6", "#1565C0", "#283593", "#8E24AA"];

const CreateBoard = () => {
  const [openPopover, setOpenPopover] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [boardTitle, setBoardTitle] = useState("");
  const [selectedBg, setSelectedBg] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [viewPermission, setViewPermission] = useState("");
  // const userId = localStorage.getItem("user_id"); // ID được lưu sau khi đăng nhập

  // Sử dụng hook useCreateBoard
  // Sử dụng hook useCreateBoard
  const { mutate: createBoard, isLoading: isCreatingBoard } = useCreateBoard();
  const {
    mutate: fetchUnsplashImages,
    data: unsplashImages,
    isLoading: unsplashingImages,
  } = useImageUnsplash();

  // Sử dụng hook useGetWorkspaces
  const {
    data: workspaces,
    isLoading: isLoadingWorkspaces,
    error,
  } = useGetWorkspaces();

  const {
    data: colors,
    isLoading: isLoadingColors,
    error: errorColors,
  } = useColor();
  // Lấy danh sách màu từ API và chỉ tính toán lại khi `colors` thay đổi
  const memoizedColors = useMemo(() => {
    if (!colors || !Array.isArray(colors)) return [];
    return colors.map((color) => ({
      id: color.id,
      hex: color.hex_code || "#1693E1", // Đảm bảo có giá trị mặc định
    }));
  }, [colors]);

  // console.log(colors);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenPopover(true);
    fetchUnsplashImages(); // Gọi API lấy ảnh
  };

  const handleClose = () => {
    setOpenPopover(false);
    setAnchorEl(null);
  };

  const handleSelectBg = (bg) => {
    setSelectedBg(bg); // Nếu là mã màu, gán trực tiếp
  };

  const handleCreateBoard = () => {
    if (boardTitle.trim() === "") {
      alert("Vui lòng nhập tiêu đề bảng!");
      return;
    }

    const boardData = {
      name: boardTitle,
      thumbnail: selectedBg,
      workspace_id: workspace,
      visibility: viewPermission,
    };

    createBoard(boardData, {
      onSuccess: (data) => {
        console.log(data);
        alert(`🎉 Bảng "${boardTitle}" đã được tạo thành công!`);
        handleClose();
      },
      onError: (error) => {
        alert(`❌ Lỗi khi tạo bảng: ${error.message}`);
      },
    });

    console.log("📩 Dữ liệu gửi lên API:", boardData);
  };

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
          <Typography sx={{ color: "Black", fontWeight: "bold" }}>
            Tạo bảng mới
          </Typography>
        </Box>
      </ListItem>

      <Popover
        open={openPopover}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <Box
          sx={{
            width: 350,
            p: 2,
            borderRadius: "8px",
            bgcolor: "white",
            boxShadow: 3,
          }}
        >
          <Typography variant="h6" fontWeight="bold" textAlign="center">
            Tạo bảng
          </Typography>

          <Box
            sx={{
              width: "100%",
              height: "100px",
              background: selectedBg.startsWith("#")
                ? selectedBg
                : `url(${selectedBg}) center/cover no-repeat`,
              borderRadius: "8px",
            }}
          />

          <Typography variant="subtitle1" mt={2} fontWeight="bold">
            Phông nền
          </Typography>

          {isLoadingColors ? (
            <Typography>Đang tải màu...</Typography>
          ) : errorColors ? (
            <Typography color="error">Lỗi khi tải màu</Typography>
          ) : memoizedColors.length > 0 ? (
            <Grid container spacing={1} mt={1}>
              {memoizedColors.map((color) => (
                <Grid item key={color.id}>
                  <Box
                    sx={{
                      width: "50px",
                      height: "35px",
                      backgroundColor: color.hex,
                      borderRadius: "4px",
                      cursor: "pointer",
                      border:
                        selectedBg === color.hex ? "2px solid #007BFF" : "none",
                    }}
                    onClick={() => handleSelectBg(color.hex)}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography>Không có màu nào khả dụng</Typography>
          )}

          <Typography variant="subtitle1" mt={2} fontWeight="bold">
            Ảnh từ Unsplash
          </Typography>

          {/* Ảnh từ Unsplash */}
          <Grid container spacing={1} mt={1}>
            {unsplashImages?.map((image, index) => (
              <Grid item key={index}>
                <Box
                  component="img"
                  src={image.urls.small}
                  sx={{
                    width: "50px",
                    height: "35px",
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

          <IconButton
            onClick={handleClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6" mt={2} fontWeight="bold">
            Tiêu đề bảng <span style={{ color: "red" }}>*</span>
          </Typography>

          <TextField
            fullWidth
            label="Tiêu đề bảng"
            variant="outlined"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            error={boardTitle.trim() === ""}
            helperText={
              boardTitle.trim() === "" ? "👋 Tiêu đề bảng là bắt buộc" : ""
            }
            sx={{ marginBottom: 2 }}
          />

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Không gian làm việc
          </Typography>
          {/* <Select
                        fullWidth
                        value={workspace}
                        onChange={(e) => setWorkspace(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    >
                        <MenuItem value="workspace1">Workspace 1</MenuItem>
                        <MenuItem value="workspace2">Workspace 2</MenuItem>
                    </Select> */}

          {isLoadingWorkspaces ? (
            <Typography>Đang tải...</Typography>
          ) : error ? (
            <Typography color="error">Lỗi tải workspace</Typography>
          ) : (
            <Select
              fullWidth
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              sx={{ marginBottom: 2 }}
            >
              {(workspaces ?? []).map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.name}
                </MenuItem>
              ))}
            </Select>
          )}

          <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
            Quyền xem
          </Typography>
          <Select
            fullWidth
            value={viewPermission}
            onChange={(e) => setViewPermission(e.target.value)}
            sx={{ marginBottom: 2 }}
          >
            {/* <MenuItem value="default">Không gian làm việc</MenuItem> */}
            <MenuItem value="private">
              <LockIcon fontSize="small" />
              Riêng tư
            </MenuItem>
            <MenuItem value="member">
              <GroupsIcon fontSize="small" />
              Không gian làm việc
            </MenuItem>
            <MenuItem value="public">
              <PublicIcon fontSize="small" />
              Công khai
            </MenuItem>
          </Select>

          <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateBoard}
              disabled={isCreatingBoard || boardTitle.trim() === ""}
            >
              {isCreatingBoard ? "Đang tạo..." : "Tạo bảng"}
            </Button>
          </Box>
        </Box>
      </Popover>
    </div>
  );
};

export default CreateBoard;
