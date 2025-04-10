import React, { useContext, useEffect, useState } from "react";
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
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import AutomationDialog from "./childComponent/Auto/Auto";
import FilterDialog from "./childComponent/Filter/Filter";
import ViewPermissionsDialog from "./childComponent/View/View";
import ShareBoardDialog from "./childComponent/Share/Share";
import BoardMenu from "./BoardMenu";

import { useUpdateBoardName } from "../../../../../hooks/useBoard";
import BoardContext from "../../../../../contexts/BoardContext";
import { useGetBoardMembers, useMemberJoinedListener } from "../../../../../hooks/useInviteBoard";
import { useParams } from "react-router-dom";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";
import { useUser } from "../../../../../hooks/useUser";

import LockIcon from "@mui/icons-material/Lock"; // Icon cho Riêng tư
import GroupIcon from "@mui/icons-material/Group"; // Icon cho Không gian làm việc
import PublicIcon from "@mui/icons-material/Public";

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

  const { boardId } = useParams();
  const { board, isLoading, error } = useContext(BoardContext);
  const { data: boardMembers  = [] } = useGetBoardMembers(boardId);
  // console.log(board);
  const { data: user } = useUser();
  useMemberJoinedListener(user?.id)

  const currentUserId = user?.id; 

  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const handleFilterDialogOpen = () => setOpenFilterDialog(true);
  const handleFilterDialogClose = () => setOpenFilterDialog(false);

  const [openAutomationDialog, setOpenAutomationDialog] = useState(false);
  const handleAutomationDialogOpen = () => setOpenAutomationDialog(true);
  const handleAutomationDialogClose = () => setOpenAutomationDialog(false);

  const [openViewPermissionsDialog, setOpenViewPermissionsDialog] =
    useState(false);
  const handleViewPermissionsDialogOpen = () =>
    setOpenViewPermissionsDialog(true);
  const handleViewPermissionsDialogClose = () =>
    setOpenViewPermissionsDialog(false);

  const [openShareDialog, setOpenShareDialog] = useState(false);
  // const [editTitle, setEditTitle] = useState(false);
  // const [teamName, setTeamName] = useState(board?.title || "Team WD-51");

  const [editTitle, setEditTitle] = useState(false);
  const [teamName, setTeamName] = useState(board?.title);
  const updateBoardName = useUpdateBoardName();

  const admins = Array.isArray(boardMembers?.data) 
  ? boardMembers.data.filter(member => member.pivot.role === "admin") 
  : [];

  const isAdmin = Array.isArray(boardMembers?.data) 
  ? boardMembers.data.some(member => 
      member.id === currentUserId && member.pivot.role === "admin"
    ) 
  : false;


  // Quản lý trạng thái sao (isStarred)
  const [isStarred, setIsStarred] = useState(false);

  const handleStarClick = () => {
    setIsStarred((prev) => !prev); // Đảo ngược trạng thái sao
  };


  // const handleTitleClick = () => setEditTitle(true);

  // const handleTitleChange = (e) => setTeamName(e.target.value);

  // const handleTitleBlur = () => setEditTitle(false);

  // const handleTitleKeyPress = (e) => {
  //   if (e.key === "Enter") {
  //     setEditTitle(false);
  //   }
  // };

  // const { boardId } = useParams(); // Lấy boardId từ URL
  // console.log("🔍 user từ useParams:", user);

  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["board", boardId],
  //   queryFn: () => getBoardById(boardId),
  // });

  // console.log(isAdmin);

  // // console.log("🔍 Dữ liệu board từ API:", data?.data);

  // const board = data?.data;

  // console.log("🔍 Dữ liệu board từ API:", board);

  // const updateBoardName = useUpdateBoardName();



  // Cập nhật khi dữ liệu board thay đổi
  // React.useEffect(() => {
  //   if (board) {
  //     setTeamName(board.name || "Team WD-51");
  //   }
  // }, [board]);

  const handleTitleClick = () => setEditTitle(true);

  const handleTitleChange = (e) => setTeamName(e.target.value);

  const handleTitleBlur = () => {
    if (teamName.trim() === "" || teamName === board?.name) {
      setEditTitle(false);
      return;
    }

    updateBoardName.mutate(
      { boardId: board.id, name: teamName, workspaceId: board.workspaceId  },
      {
        onSuccess: () => {
          setEditTitle(false);
        },
      }
    );
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  if (isLoading) return <p>Loading board...</p>;
  if (error) return <p>Board not found</p>;

  const boardVisibility = board?.visibility || "test"; // Default to "Private"

  const getVisibilityProps = (boardVisibility) => {
    switch (boardVisibility) {
      case "private":
        return {
          icon: <LockIcon sx={{ color: "red" }} />,
          label: "Riêng tư",
        };
      case "workspace":
        return {
          icon: <GroupIcon sx={{ color: "blue" }} />,
          label: "Không gian làm việc",
        };
      case "public":
        return {
          icon: <PublicIcon sx={{ color: "green" }} />,
          label: "Công khai",
        };
      default:
        return {
          icon: <LockIcon sx={{ color: "red" }} />,
          label: "Riêng tư", // Giá trị mặc định nếu boardVisibility không hợp lệ
        };
    }
  };
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        borderBottom: "2px solid #808e9b",
        justifyContent: "space-between",
        gap: 2,
        overflowX: "auto",
      }}
    >
      <Box px={1} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {/*Chỉnh sửa tiêu đề  */}
        {editTitle ? (
          <TextField
            value={teamName ?? board?.title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress}
            variant="outlined"
            size="small"
            disabled={!isAdmin} // ❌ Chặn nếu không phải admin
            sx={{
              width: "80px",
              height: "30px",
              "& .MuiInputBase-root": {
                fontSize: "0.7rem",
                backgroundColor: isAdmin ? "#ffffff" : "#e0e0e0", // Khác màu nếu bị disable
              },
              "& .MuiInputBase-input": { textAlign: "center" },
              "& .MuiOutlinedInput-root": { borderRadius: "8px" },
            }}
          />
        ) : (
          <Chip label={teamName ?? board?.title} sx={style} onClick={isAdmin ? handleTitleClick : undefined} />
        )}

        {/* <StarButton isStarred={isStarred} onStarClick={handleStarClick} /> */}
        <Chip
          icon={getVisibilityProps(boardVisibility).icon}
          label={getVisibilityProps(boardVisibility).label}
          variant="outlined"
          clickable
          sx={style}
          onClick={handleViewPermissionsDialogOpen}
        />

        <Chip
          icon={<BoltIcon />}
          label="Tự động hóa"
          variant="outlined"
          clickable
          sx={style}
          onClick={handleAutomationDialogOpen}
        />
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
          {boardMembers?.data?.map((member) => (
            <Tooltip key={member.id} title={member.full_name}>
              <div style={{ position: "relative", display: "inline-block" }}>
                {/* Avatar với chữ cái đầu */}
                <Avatar
                  alt={member.full_name}
                  src={member.avatar || ""}
                  sx={{
                    width: 40,
                    height: 40,
                    backgroundColor: "#1976d2",
                    fontSize: "16px",
                    fontWeight: "bold",
                    position: "relative", // Để chứa icon bên trong
                  }}
                >
                  {!member.avatar && member.full_name.charAt(0).toUpperCase()}

                  {/* Icon vương miện nếu là admin */}
                  {member.pivot.role === "admin" && (
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
                </Avatar>
              </div>
            </Tooltip>
          ))}
        </AvatarGroup>
        <Button
          variant="contained"
          startIcon={<PersonAddAltIcon />}
          sx={{
            color: "white",
            backgroundColor: "primary.dark",
            fontSize: "0.75rem",
            textTransform: "none",
          }}
          onClick={() => setOpenShareDialog(true)}
        >
          Chia sẻ
        </Button>
        <BoardMenu board={board} />
      </Box>

      {/* Hộp thoại chia sẻ */}
      <ShareBoardDialog
        boardMembers={boardMembers}
        currentUser={user}
        open={openShareDialog}
        onClose={() => setOpenShareDialog(false)}
      />

      {/* Hộp thoại lọc */}
      <FilterDialog open={openFilterDialog} onClose={handleFilterDialogClose} />

      {/* Hộp thoại tự động hóa */}
      <AutomationDialog
        open={openAutomationDialog}
        onClose={handleAutomationDialogClose}
      />

      {/* Hộp thoại quyền xem */}
      <ViewPermissionsDialog
        open={openViewPermissionsDialog}
        onClose={handleViewPermissionsDialogClose}
      />
    </Box>
  );
};

export default BoardBar;
