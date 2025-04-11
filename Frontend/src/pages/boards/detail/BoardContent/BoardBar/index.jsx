import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Avatar,
  AvatarGroup,
  Box,
  Button,
  Chip,
  Tooltip,
  TextField,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import BoltIcon from "@mui/icons-material/Bolt";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AutomationDialog from "./childComponent/Auto/Auto";
import FilterDialog from "./childComponent/Filter/Filter";
import ViewPermissionsDialog from "./childComponent/View/View";
import ShareBoardDialog from "./childComponent/Share/Share";
import BoardMenu from "./BoardMenu";
import { useMemberJoinedListener } from "../../../../../hooks/useInviteBoard";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";
import { useMe } from "../../../../../contexts/MeContext";
import { useBoard } from "../../../../../contexts/BoardContext";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateBoardName } from "../../../../../hooks/useBoard";

const style = {
  border: "none",
  fontWeight: "bold",
  borderRadius: "8px",
  fontSize: "14px",
  color: "#ffffff",
  ":hover": { backgroundColor: "" },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
    color: "#ffffff",
  },
};

const BoardBar = () => {
  const { user } = useMe();
  const { board, members, memberships, isLoading, error, isEditable } = useBoard();

  const combinedMembers = useMemo(() => {
    if (!members || !memberships) return [];

    return members.map((member) => {
      const membership = memberships.find((m) => m.user_id === member.id);
      return {
        ...member,
        role: membership ? membership.role : "member", // Mặc định là "member" nếu không tìm thấy
        is_deactivated: membership ? membership.is_deactivated : 0,
      };
    });
  }, [members, memberships]);

  const queryClient = useQueryClient();

  // Quản lý trạng thái dialog
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [openAutomationDialog, setOpenAutomationDialog] = useState(false);
  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] = useState(false);
  const [openShareDialog, setOpenShareDialog] = useState(false);

  // Quản lý trạng thái chỉnh sửa tiêu đề
  const [editTitle, setEditTitle] = useState(false);
  const [teamName, setTeamName] = useState(board?.name);

  // const [editTitle, setEditTitle] = useState(false);
  // const [teamName, setTeamName] = useState(board?.title);
  // const updateBoardName = useUpdateBoardName();

  // const admins = Array.isArray(boardMembers?.data)
  //   ? boardMembers.data.filter(member => member.pivot.role === "admin")
  //   : [];

  // const isAdmin = Array.isArray(boardMembers?.data)
  //   ? boardMembers.data.some(member =>
  //     member.id === currentUserId && member.pivot.role === "admin"
  //   )
  //   : false;


  // Quản lý trạng thái sao (isStarred)
  const [isStarred, setIsStarred] = useState(false);

  // Hook để cập nhật tên board
  const updateBoardName = useUpdateBoardName();

  // Cập nhật teamName khi board thay đổi
  useEffect(() => {
    if (board) {
      setTeamName(board?.name || "Untitled Board");
    }
  }, [board]);

  // Xử lý mở/đóng dialog
  const handleFilterDialogOpen = () => setOpenFilterDialog(true);
  const handleFilterDialogClose = () => setOpenFilterDialog(false);

  const handleAutomationDialogOpen = () => setOpenAutomationDialog(true);
  const handleAutomationDialogClose = () => setOpenAutomationDialog(false);

  const handleViewPermissionsDialogOpen = () => setOpenViewPermissionsDialog(true);
  const handleViewPermissionsDialogClose = () => setOpenViewPermissionsDialog(false);

  const handleShareDialogOpen = () => setOpenShareDialog(true);
  const handleShareDialogClose = () => setOpenShareDialog(false);

  // Xử lý chỉnh sửa tiêu đề
  const handleTitleClick = () => {
    if (isEditable) {
      setEditTitle(true);
    }
  };

  const handleTitleChange = (e) => setTeamName(e.target.value);

  const handleTitleBlur = useCallback(() => {
    if (teamName.trim() === "" || teamName === board?.name) {
      setTeamName(board?.name || "Untitled Board");
      setEditTitle(false);
      return;
    }

    if (board?.id) {
      updateBoardName.mutate(
        { boardId: board.id, name: teamName },
        {
          onSuccess: () => {
            setEditTitle(false);
            // Làm mới dữ liệu board sau khi cập nhật tên
            queryClient.invalidateQueries(["board", board.id]);
          },
          onError: (err) => {
            console.error("Error updating board name:", err);
            setTeamName(board?.name || "Untitled Board");
            setEditTitle(false);
          },
        }
      );
    }
  }, [teamName, board, updateBoardName, queryClient]);

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  // Xử lý đánh dấu sao
  const handleStarClick = () => {
    setIsStarred((prev) => !prev);
    // TODO: Gọi API để lưu trạng thái isStarred vào backend
    // Ví dụ: axios.post(`/api/boards/${board.id}/star`, { isStarred: !isStarred });
  };
  const boardVisibility = board?.visibility || "Private";

  return (
    <Box
      sx={{
        // ---------------------------
        backgroundColor: "rgba(46, 46, 46, 0.3)", // 👈 Từ 0.6 → 0.8
        backdropFilter: "blur(4px)",        // 👈 Từ 10px → 4px
        WebkitBackdropFilter: "blur(4px)",  // Safari
        // ---------------------------
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        overflowX: "auto",
      }}
    >
      <Box px={1} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/* Chỉnh sửa tiêu đề */}
        {editTitle ? (
          <TextField
            value={teamName ?? board?.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
            variant="outlined"
            size="small"
            autoFocus
            sx={{
              width: "120px",
              height: "30px",
              "& .MuiInputBase-root": {
                fontSize: "0.9rem",
                backgroundColor: "#2E4053",
                color: "#ffffff",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              },
              "& .MuiInputBase-input": { textAlign: "center" },
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          />
        ) : (
          <Chip
            label={teamName}
            sx={{
              ...style,
              cursor: isEditable ? "pointer" : "default",
            }}
            onClick={handleTitleClick}
          />
        )}

        {/* Nút đánh dấu sao */}
        <Chip
          icon={isStarred ? <StarIcon /> : <StarBorderIcon />}
          variant="outlined"
          clickable
          sx={style}
          onClick={handleStarClick}
        />

        {/* Khả năng xem */}
        <Chip
          icon={<LockOpenIcon />}
          label={`Khả năng xem: ${boardVisibility}`}
          variant="outlined"
          clickable
          sx={style}
          onClick={handleViewPermissionsDialogOpen}
        />

        {/* Tự động hóa */}
        <Chip
          icon={<BoltIcon />}
          label="Tự động hóa"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleAutomationDialogOpen}
        />

        {/* Lọc bảng */}
        <Chip
          icon={<FilterListIcon />}
          label="Lọc bảng"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleFilterDialogOpen}
        />
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", paddingX: 2 }}>
        {/* Avatar thành viên */}
        <AvatarGroup
          max={5}
          sx={{
            paddingX: "8px",
            "& .MuiAvatar-root": {
              height: "30px",
              width: "30px",
              fontSize: "16px",
            },
          }}
        >
          {combinedMembers.map((member) => (
            <Tooltip key={member.id} title={member.user_name || member.full_name}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  alt={member.user_name || member.full_name}
                  src={member.image || ""}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#1976d2",
                    fontSize: "16px",
                    fontWeight: "bold",
                    position: "relative",
                  }}
                >
                  {!(member.image) &&
                    (member.user_name || member.full_name)?.charAt(0).toUpperCase()}
                </Avatar>
                {member.role === "admin" && (
                  <ChevronDoubleDownIcon
                    className="h-4 w-3 text-yellow-500"
                    style={{
                      position: "absolute",
                      bottom: -5,
                      right: 1,
                      background: "",
                      borderRadius: "50%",
                      padding: "2px",
                    }}
                  />
                )}
              </div>
            </Tooltip>
          ))}
        </AvatarGroup>

        {/* Nút chia sẻ */}
        <Button
          variant="contained"
          startIcon={<PersonAddAltIcon />}
          sx={{
            color: "white",
            backgroundColor: "primary.dark",
            fontSize: "0.75rem",
            textTransform: "none",
          }}
          onClick={handleShareDialogOpen}
        >
          Chia sẻ
        </Button>

        <BoardMenu board={board} />
      </Box>

      {/* Dialogs */}
      <ShareBoardDialog
        boardMembers={combinedMembers}
        currentUser={user}
        open={openShareDialog}
        onClose={handleShareDialogClose}
      />
      <FilterDialog open={openFilterDialog} onClose={handleFilterDialogClose} />
      <AutomationDialog
        open={openAutomationDialog}
        onClose={handleAutomationDialogClose}
      />
      <ViewPermissionsDialog
        open={openViewPermissionsDialog}
        onClose={handleViewPermissionsDialogClose}
      />
    </Box>
  );
};

export default BoardBar;