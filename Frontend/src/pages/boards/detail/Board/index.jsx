import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Popover,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  InputAdornment,
  List,
  ListItem,
  CircularProgress,
  DialogActions,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Divider, MenuItem } from "@mui/material";
import CreateBoard from "../../../../components/CreateBoard";
import MyBoard from "../../../../components/MyBoard";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../../../hooks/useWorkspace";
import WorkspaceInfo from "../../../../components/WorkspaceInfo";
import { Archive, Delete, Restore } from "@mui/icons-material";
import { useClosedBoards, useForceDestroyBoard, useToggleBoardClosed } from "../../../../hooks/useBoard";

const Board = () => {
  const { workspaceName } = useParams();
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceByName(workspaceName, {
    enabled: !!workspaceName,
  });
  const { data: closedBoards, isLoading: loadingClosed } = useClosedBoards();
  const { mutate: toggleBoardClosed } = useToggleBoardClosed(workspaceName);
  // const { mutate: toggleClosed } = useToggleBoardClosed(workspaceName);

  const { mutate: destroyBoard, isPending: isDeleting } = useForceDestroyBoard();

  // console.log(workspace);

  const [isFormVisible, setFormVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [openClosedBoards, setOpenClosedBoards] = useState(false);

  const handleOpenClosedBoards = () => setOpenClosedBoards(true);
  const handleCloseClosedBoards = () => setOpenClosedBoards(false);
  const handleOpenInvite = () => {
    setInviteOpen(true);
    setLinkCopied(false);
    setIsLinkActive(false);
  };

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };


  const handleCopyLink = () => {
    setLinkCopied(true);
    setIsLinkActive(true);
    setShowCopiedMessage(true);
    navigator.clipboard.writeText("https://example.com/invite-link");
    setTimeout(() => setShowCopiedMessage(false), 3000);
  };

  const handleDisableLink = () => {
    setIsLinkActive(false);
    setLinkCopied(false);
  };
  const handleCloseInvite = () => {
    setInviteOpen(false);
  };

  const [openMainPopover, setOpenMainPopover] = useState(false);
  const [openCreatePopover, setOpenCreatePopover] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collectionName, setCollectionName] = useState("");
  const [collections, setCollections] = useState([]);

  // Mở popover Bộ sưu tập
  const handleMainPopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenMainPopover(true);
  };

  const handleMainPopoverClose = () => {
    setOpenMainPopover(false);
  };

  // Mở popover Tạo bộ sưu tập
  const handleCreatePopoverOpen = () => {
    handleMainPopoverClose(); // Đóng popover chính
    setOpenCreatePopover(true);
  };

  const handleCreatePopoverClose = () => {
    setOpenCreatePopover(false);
    setCollectionName("");
  };

  // Lưu bộ sưu tập
  const handleSaveCollection = () => {
    if (collectionName.trim()) {
      setCollections([...collections, collectionName.trim()]);
      handleCreatePopoverClose();
    }
  };

  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [anchorElCreateBoard, setAnchorElCreateBoard] = useState(null);

  const handleOpenCreateBoard = (event) => {
    setAnchorElCreateBoard(event.currentTarget);
    setShowCreateBoard(true);
  };

  const handleCloseCreateBoard = () => {
    setShowCreateBoard(false);
    setAnchorElCreateBoard(null);
  };

  const handleReopenBoard = (boardId) => {
    toggleBoardClosed(boardId);
  };

  // Hàm xóa hoàn toàn board
  const handleDeleteBoard = (boardId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bảng này không?");
    if (!confirm) return;

    destroyBoard(boardId, {
      onSuccess: () => {
        // alert("✅ Đã xóa bảng thành công!");
        // Gợi ý: bạn có thể gọi refetch hoặc invalidate query ở đây nếu cần cập nhật lại danh sách
      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa bảng:", error);
        alert("Xảy ra lỗi khi xóa bảng!");
      },
    });
  };


  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        padding: "20px",
        margin: "30px auto",
      }}
    >
      {/* Header chứa Tiêu đề và Nút Mời Thành Viên */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #D3D3D3",
          paddingBottom: "40px",
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          minHeight: "80px",
        }}
      >
        {/* Nếu form chưa hiển thị, hiển thị avatar và tiêu đề */}
        {!isFormVisible ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar
              sx={{
                bgcolor: "#5D87FF",
                width: "80px",
                height: "80px",
                marginLeft: "100px",
              }}
            >
              <span style={{ fontSize: "30px", fontWeight: "bold" }}>
                {workspace?.display_name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography fontWeight="bold" sx={{ fontSize: 25 }}>
                  {workspace?.display_name}
                </Typography>
                <IconButton
                  onClick={toggleFormVisibility}
                  sx={{ color: "gray", "&:hover": { backgroundColor: "transparent" } }}
                >
                  <EditIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px", color: "gray" }}>
                <LockIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: 14 }}>Riêng tư</Typography>
              </Box>
              <Typography fontWeight="bold" sx={{ fontSize: "1.2rem", mt: 2 }}>
                {workspace?.desc}
              </Typography>
            </Box>
          </Box>
        ) : (
          <WorkspaceInfo workspaceInfo={workspace} onCancel={toggleFormVisibility} refetchWorkspace={refetchWorkspace} />
        )}

        <Button
          variant="contained"
          sx={{
            bgcolor: "#026AA7",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "8px 12px",
            boxShadow: "none",
            marginRight: "60px",
            "&:hover": { bgcolor: "#005A96" },
          }}
          onClick={handleOpenInvite}
        >
          Mời các thành viên Không gian làm việc
        </Button>
      </Box>
      {/* Modal Mời Thành Viên */}
      <Dialog
        open={isInviteOpen}
        onClose={handleCloseInvite}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "20px" }}>
          Mời vào Không gian làm việc
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={handleCloseInvite}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Địa chỉ email hoặc tên"
            sx={{ marginBottom: "10px" }}
          />
          <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                bgcolor: linkCopied ? "#E6F4EA" : "transparent",
                borderRadius: 1,
              }}
            >
              {showCopiedMessage ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="success.main">
                    Liên kết đã sao chép vào khay nhớ tạm
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Mời ai đó vào Không gian làm việc này bằng liên kết:
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleCopyLink}
              >
                {linkCopied ? "Đã sao chép" : "Tạo liên kết"}
              </Button>
            </Stack>
            {isLinkActive && (
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  textAlign: "right",
                }}
                onClick={handleDisableLink}
              >
                Tắt liên kết
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>
      {/* Nội dung */}

      <Box
        sx={{
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          marginTop: "20px",
        }}
      >
        {/* Tiêu đề Bảng */}
        <Typography sx={{ fontSize: 20, fontWeight: "bold", mb: 2 }}>
          Bảng
        </Typography>

        {/* Bộ lọc */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            mb: 4,
          }}
        >
          <Box sx={{ display: "flex", gap: 4 }}>
            <Box>
              <Typography
                sx={{
                  mb: 1,
                  color: "gray",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                Sắp xếp theo
              </Typography>
              <TextField
                select
                size="small"
                defaultValue="activity"
                sx={{ minWidth: 200, fontSize: "13px" }}
                SelectProps={{ native: true }}
              >
                <option value="activity">Hoạt động gần đây nhất</option>
                <option value="nameAZ">Ít hoạt động gần đây nhất</option>
                <option value="nameAZ">Theo bảng chữ cái A-Z</option>
                <option value="nameZA">Theo bảng chữ cái Z-A</option>
              </TextField>
            </Box>

            <Box>
              <Typography
                sx={{
                  mb: 1,
                  color: "gray",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                Lọc theo
              </Typography>

              {/* Ô chọn bộ sưu tập */}
              <TextField
                size="small"
                sx={{ minWidth: 220 }}
                value={selectedCollection || "Chọn bộ sưu tập"}
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: selectedCollection ? "black" : "gray",
                    "& .MuiInputBase-input": {
                      color: selectedCollection ? "black" : "gray",
                    },
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <ArrowDropDownIcon sx={{ cursor: "pointer" }} />
                    </InputAdornment>
                  ),
                }}
                onClick={handleMainPopoverOpen}
              />

              {/* Popover chính */}
              <Popover
                open={openMainPopover}
                anchorEl={anchorEl}
                onClose={handleMainPopoverClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, width: 320, textAlign: "center" } }}
              >
                <Typography sx={{ fontWeight: "bold", mb: 1, color: "gray" }}>
                  Bộ sưu tập
                </Typography>

                {/* Render danh sách bộ sưu tập */}
                {collections.map((item, index) => (
                  <MenuItem
                    key={index}
                    onClick={() => {
                      setSelectedCollection(item);
                      handleMainPopoverClose();
                    }}
                  >
                    • {item}
                  </MenuItem>
                ))}
                {selectedCollection && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      onClick={() => {
                        setSelectedCollection("");
                        handleMainPopoverClose();
                      }}
                      sx={{ color: "gray" }}
                    >
                      Làm sạch bộ lọc...
                    </MenuItem>
                  </>
                )}

                <Divider sx={{ my: 1 }} />

                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#0052CC",
                    textTransform: "none",
                    width: "170px",
                  }}
                  onClick={handleCreatePopoverOpen}
                >
                  Tạo một bộ sưu tập
                </Button>
              </Popover>

              {/* Popover Tạo bộ sưu tập mới */}
              <Popover
                open={openCreatePopover}
                anchorEl={anchorEl} // Dùng cùng anchor để "replace" đúng vị trí
                onClose={handleCreatePopoverClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, width: 320 } }}
              >
                <Box sx={{ position: "relative" }}>
                  <Typography
                    sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
                  >
                    Tạo bộ sưu tập mới
                  </Typography>

                  <IconButton
                    onClick={handleCreatePopoverClose}
                    sx={{ position: "absolute", top: 0, right: 0 }}
                  >
                    <CloseIcon />
                  </IconButton>

                  <Typography sx={{ mb: 1 }}>Tên</Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Nhập tên bộ sưu tập"
                    value={collectionName}
                    onChange={(e) => setCollectionName(e.target.value)}
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    fullWidth
                    disabled={!collectionName.trim()}
                    sx={{
                      bgcolor: !collectionName.trim() ? "#F4F5F7" : "#0052CC",
                      color: !collectionName.trim() ? "gray" : "#fff",
                      textTransform: "none",
                    }}
                    onClick={handleSaveCollection}
                  >
                    Lưu
                  </Button>
                </Box>
              </Popover>
            </Box>
          </Box>

          {/* Ô tìm kiếm */}
          <Box sx={{ mt: { xs: 2, md: 0 } }}>
            <Typography
              sx={{
                mb: 1,
                color: "gray",
                fontSize: "13px",
                fontWeight: "bold",
              }}
            >
              Tìm kiếm
            </Typography>
            <TextField
              size="small"
              placeholder="Tìm kiếm các bảng"
              InputProps={{
                startAdornment: (
                  <SearchOutlinedIcon sx={{ color: "gray", mr: 1 }} />
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>
        </Box>
        <List sx={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>

          <ListItem sx={{ width: "auto", padding: 0 }}>
            <Box
              onClick={handleOpenCreateBoard}
              sx={{
                width: "180px",
                height: "100px",
                backgroundColor: '#091e420f',
                borderRadius: "8px",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: "14px",
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: '#DCDFE4',
                  transition: 'background-color 85ms ease-in', // Apply transition to background-color
                },
              }}
            >
              Tạo bảng mới
            </Box>
          </ListItem>


          {/* Tạo bảng mới */}
          <CreateBoard
            workspaceId={workspace?.id} // Truyền workspaceId nếu cần
            open={showCreateBoard}
            anchorEl={anchorElCreateBoard}
            onClose={handleCloseCreateBoard}

          />
          {/* Bảng Trello của tôi */}
          {workspace?.boards && workspace.boards.length > 0 ? (
            workspace?.boards
              ?.sort((a, b) => {
                const dateA = a.last_accessed ? new Date(a.last_accessed) : new Date(0);
                const dateB = b.last_accessed ? new Date(b.last_accessed) : new Date(0);
                return dateB - dateA;
              })
              ?.map((board) => (
                <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                  <MyBoard
                    key={board.id}
                    board={board}
                    id={`recent-board-${board.id}`}
                  />
                </ListItem>
              ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              Không có bảng nào.
            </Typography>
          )}


        </List>

        {closedBoards?.data?.length > 0 && (
          <Button
            variant="outlined"
            sx={{
              backgroundColor: "#EDEBFC",
              height: "30px",
              width: "250px",
              marginTop: "40px",
            }}
            onClick={handleOpenClosedBoards}
            startIcon={<Archive />}
          >
            Xem tất cả các bảng đã đóng
          </Button>
        )}


        {/* Popup hiển thị danh sách bảng đã đóng */}
        <Dialog open={openClosedBoards} onClose={handleCloseClosedBoards} fullWidth>
          <DialogTitle fontWeight="bold">📌 Các bảng đã đóng</DialogTitle>
          <DialogContent>
            {loadingClosed ? (
              <CircularProgress />
            ) : closedBoards?.data?.length > 0 ? (
              <List>
                {closedBoards?.data?.map((board) => (
                  <ListItem
                    key={board.id}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      padding: "8px 0",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "#f4f4f4",
                        borderRadius: "8px",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar src={board.thumbnail || "https://via.placeholder.com/150"} />
                    </ListItemAvatar>
                    <ListItemText
                      primary={board.name}
                      secondary={`Không gian làm việc: ${board.workspace?.display_name || "Không rõ"}`}
                    />
                    <IconButton onClick={() => handleReopenBoard(board.id)} color="primary">
                      <Restore />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteBoard(board.id)}
                      color="error"
                      disabled={isDeleting}
                    >
                      {isDeleting ? <CircularProgress size={20} /> : <Delete />}
                    </IconButton>
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="textSecondary" >
                Không có bảng nào đã đóng!
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseClosedBoards} color="primary">
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};
export default Board;
