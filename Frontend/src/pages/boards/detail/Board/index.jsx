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
import RestoreIcon from '@mui/icons-material/Restore';
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { Divider, MenuItem } from "@mui/material";
import CreateBoard from "../../../../components/CreateBoard";
import MyBoard from "../../../../components/MyBoard";
import { useParams } from "react-router-dom";
import { useGetWorkspaceById } from "../../../../hooks/useWorkspace";
import { useClosedBoards, useForceDestroyBoard, useToggleBoardClosed } from "../../../../hooks/useBoard";
import WorkspaceHeader from "../Member/Common/WorkspaceHeader";
import { Archive, Delete } from "@mui/icons-material";
import LogoLoading from "../../../../components/Common/LogoLoading";
import PrivatePage from "../Private/PrivatePage";

const Board = () => {
  const { workspaceId } = useParams();

  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceById(workspaceId, {
    enabled: !!workspaceId,
  });

  const { data: closedBoards, isLoading: loadingClosed } = useClosedBoards(workspaceId);
  const { mutate: toggleBoardClosed } = useToggleBoardClosed(workspaceId);
  const { mutate: destroyBoard, isPending: isDeleting } = useForceDestroyBoard();

  // Placeholder for admin status (adjust based on your auth logic)
  const isAdmin = workspace?.isCurrentUserAdmin || false;

  const [isFormVisible, setFormVisible] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [openClosedBoards, setOpenClosedBoards] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterByVisibility, setFilterByVisibility] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const handleOpenClosedBoards = () => setOpenClosedBoards(true);
  const handleCloseClosedBoards = () => setOpenClosedBoards(false);

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const [openMainPopover, setOpenMainPopover] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [anchorElCreateBoard, setAnchorElCreateBoard] = useState(null);

  const handleMainPopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
    setOpenMainPopover(true);
  };

  const handleMainPopoverClose = () => {
    setOpenMainPopover(false);
  };

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
    refetchWorkspace();
  };

  const handleDeleteBoard = (boardId) => {
    const confirm = window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bảng này không?");
    if (!confirm) return;

    destroyBoard(boardId, {
      onSuccess: () => {
        refetchWorkspace();
      },
      onError: (error) => {
        console.error("❌ Lỗi khi xóa bảng:", error);
        alert("Xảy ra lỗi khi xóa bảng!");
      },
    });
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
  };

  const sortBoards = (boards) => {
    if (!boards) return [];
    const sortedBoards = [...boards];
    switch (sortBy) {
      case "recent":
        return sortedBoards.sort((a, b) => {
          const dateA = a.last_accessed ? new Date(a.last_accessed) : new Date(0);
          const dateB = b.last_accessed ? new Date(b.last_accessed) : new Date(0);
          return dateB - dateA;
        });
      case "leastRecent":
        return sortedBoards.sort((a, b) => {
          const dateA = a.last_accessed ? new Date(a.last_accessed) : new Date(0);
          const dateB = b.last_accessed ? new Date(b.last_accessed) : new Date(0);
          return dateA - dateB;
        });
      case "nameAZ":
        return sortedBoards.sort((a, b) => a.name.localeCompare(b.name));
      case "nameZA":
        return sortedBoards.sort((a, b) => b.name.localeCompare(b.name));
      default:
        return sortedBoards;
    }
  };

  const handleFilterChange = (value) => {
    setFilterByVisibility(value);
    handleMainPopoverClose();
  };

  const filterBoards = (boards) => {
    if (!boards) return [];
    let filteredBoards = boards;

    if (filterByVisibility !== "all") {
      filteredBoards = filteredBoards.filter((board) => board.visibility === filterByVisibility);
    }

    if (searchQuery.trim()) {
      filteredBoards = filteredBoards.filter((board) =>
        board.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filteredBoards;
  };

  if (isLoadingWorkspace) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <LogoLoading />
      </Box>
    );
  }

  if (!workspace?.joined && workspace?.permission_level === "private") {
    return <PrivatePage />
  }


  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={isAdmin}
        isFormVisible={isFormVisible}
        toggleFormVisibility={toggleFormVisibility}
        refetchWorkspace={refetchWorkspace}
      />

      <Box
        sx={{
          width: "100%",
          marginTop: "20px",
        }}
      >
        <Typography sx={{ fontSize: 20, fontWeight: "bold", mb: 2 }}>
          Bảng
        </Typography>

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
                value={sortBy}
                onChange={handleSortChange}
                sx={{ minWidth: 200, fontSize: "13px" }}
                SelectProps={{ native: true }}
              >
                <option value="recent">Hoạt động gần đây nhất</option>
                <option value="leastRecent">Ít hoạt động gần đây nhất</option>
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
              <TextField
                size="small"
                sx={{ minWidth: 220 }}
                value={
                  filterByVisibility === "all"
                    ? "Tất cả"
                    : filterByVisibility === "workspace"
                      ? "Không gian làm việc"
                      : filterByVisibility === "public"
                        ? "Công khai"
                        : "Riêng tư"
                }
                InputProps={{
                  readOnly: true,
                  sx: {
                    color: filterByVisibility !== "all" ? "black" : "gray",
                    "& .MuiInputBase-input": {
                      color: filterByVisibility !== "all" ? "black" : "gray",
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
              <Popover
                open={openMainPopover}
                anchorEl={anchorEl}
                onClose={handleMainPopoverClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                PaperProps={{ sx: { p: 2, width: 220, textAlign: "center" } }}
              >
                <Typography sx={{ fontWeight: "bold", mb: 1, color: "gray" }}>
                  Lọc theo quyền truy cập
                </Typography>
                <MenuItem
                  onClick={() => handleFilterChange("all")}
                  selected={filterByVisibility === "all"}
                >
                  Tất cả
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilterChange("workspace")}
                  selected={filterByVisibility === "workspace"}
                >
                  Không gian làm việc
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilterChange("public")}
                  selected={filterByVisibility === "public"}
                >
                  Công khai
                </MenuItem>
                <MenuItem
                  onClick={() => handleFilterChange("private")}
                  selected={filterByVisibility === "private"}
                >
                  Riêng tư
                </MenuItem>
                {filterByVisibility !== "all" && (
                  <>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem
                      onClick={() => handleFilterChange("all")}
                      sx={{ color: "gray" }}
                    >
                      Xóa bộ lọc
                    </MenuItem>
                  </>
                )}
              </Popover>
            </Box>
          </Box>
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
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <SearchOutlinedIcon sx={{ color: "gray", mr: 1 }} />
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            maxHeight: 11 * 30,
            overflowY: "auto",
            width: "100%",
          }}
        >
          <List
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: "20px",
              width: "100%",
            }}
          >
            <ListItem sx={{ width: "259.2px", padding: 0 }}>
              <Box
                onClick={handleOpenCreateBoard}
                sx={{
                  width: "259.2px",
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
                    transition: 'background-color 85ms ease-in',
                  },
                }}
              >
                Tạo bảng mới
              </Box>
            </ListItem>

            <CreateBoard
              workspaceId={workspace?.id}
              open={showCreateBoard}
              anchorEl={anchorElCreateBoard}
              onClose={handleCloseCreateBoard}
            />

            {workspace?.boards?.length > 0 &&
              sortBoards(filterBoards(workspace.boards)).map((board) => {
                const isPrivate = board.visibility === "private" && !board.is_member;

                return (
                  <ListItem key={board.id} sx={{ width: "auto", padding: 0 }}>
                    <MyBoard
                      board={board}
                      id={`board-in-workspace-${board.id}`}
                      showIcon={true}
                      width={259.2}
                      isPrivate={isPrivate}
                    />
                  </ListItem>
                );
              })}
          </List>
        </Box>

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
                      <RestoreIcon />
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
              <Typography variant="body2" color="textSecondary">
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