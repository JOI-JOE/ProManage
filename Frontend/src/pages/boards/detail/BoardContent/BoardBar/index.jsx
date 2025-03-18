import React, { useContext, useState } from "react";
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
import { useGetBoardMembers } from "../../../../../hooks/useInviteBoard";
import { useParams } from "react-router-dom";
import { ChevronDoubleDownIcon } from "@heroicons/react/24/solid";




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
  const { board, isLoading, error } = useContext(BoardContext)
  const {data:boardMembers } = useGetBoardMembers(boardId)
  console.log(boardMembers);
  
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
  // // console.log("🔍 boardId từ useParams:", boardId);


  // const { data, isLoading, error } = useQuery({
  //   queryKey: ["board", boardId],
  //   queryFn: () => getBoardById(boardId),
  // });

  // console.log(data)

  // // console.log("🔍 Dữ liệu board từ API:", data?.data);


  // const board = data?.data;

  // console.log("🔍 Dữ liệu board từ API:", board);

  // const updateBoardName = useUpdateBoardName();

  const [editTitle, setEditTitle] = useState(false);
  const [teamName, setTeamName] = useState("");

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

    // updateBoardName.mutate(
    //   { board.id, name: teamName },
    //   {
    //     onSuccess: () => {
    //       setEditTitle(false);
    //     },
    //   }
    // );
  };

  const handleTitleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleTitleBlur();
    }
  };

  if (isLoading) return <p>Loading board...</p>;
  if (error) return <p>Board not found</p>;

  const boardVisibility = board?.visibility || "test"; // Default to "Private"

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
            value={teamName}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyPress={handleTitleKeyPress} //sự kiện onKeyPress
            variant="outlined"
            size="small"
            sx={{
              width: "80px",
              height: "30px",
              "& .MuiInputBase-root": {
                fontSize: "0.7rem", // Kích thước chữ khi nhập
                backgroundColor: "#2E4053",
              },
              "& .MuiInputBase-input": {
                textAlign: "center",
              },
              "& .MuiOutlinedInput-root": {
                borderRadius: "8px",
                backgroundColor: "#ffffff",
              },
            }}
          />
        ) : (
          <Chip label={teamName} sx={style} onClick={handleTitleClick} />
        )}
        {/* <StarButton isStarred={isStarred} onStarClick={handleStarClick} /> */}
        <Chip
          icon={<LockOpenIcon />}
          label={`Khả năng xem: ${boardVisibility}`} // Display the visibility status
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
