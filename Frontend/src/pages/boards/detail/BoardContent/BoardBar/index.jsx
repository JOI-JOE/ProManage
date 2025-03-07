import React, { useState } from "react";
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
import StarButton from "./childComponent/Star/Star";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { useUpdateBoardName } from "../../../../../hooks/useBoard";
import { getBoardById } from "../../../../../api/models/boardsApi";


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

  const { boardId } = useParams(); // Lấy boardId từ URL
  // console.log("🔍 boardId từ useParams:", boardId);

  
  const { data, isLoading, error } = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoardById(boardId),
  });

  const board = data?.data;
  // console.log("🔍 Dữ liệu board từ API:", board);

  const updateBoardName = useUpdateBoardName();

  const [editTitle, setEditTitle] = useState(false);
  const [teamName, setTeamName] = useState("");

  // Cập nhật khi dữ liệu board thay đổi
  React.useEffect(() => {
    if (board) {
      setTeamName(board.name || "Team WD-51");
    }
  }, [board]);

  const handleTitleClick = () => setEditTitle(true);

  const handleTitleChange = (e) => setTeamName(e.target.value);

  const handleTitleBlur = () => {
    if (teamName.trim() === "" || teamName === board?.name) {
      setEditTitle(false);
      return;
    }

    updateBoardName.mutate(
      { boardId, name: teamName },
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

  const boardVisibility = board?.visibility || "Private"; // Default to "Private"

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
        <StarButton isStarred={isStarred} onStarClick={handleStarClick} />

        {/* Show the board's visibility in the chip */}
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
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://preview.redd.it/ovfk3xy2o4q51.jpg?width=640&crop=smart&auto=webp&s=37b436dadb6283e9fafc0053bbaf44f737fe7b82"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJNffhE-2IRnlQ5P-43AtsQEy8yiJnnglJBw&s"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmyPS0TN6aIto3w_ndOpmfpjz8qbftut6bjWlE5-1s2IrrqK7OL2zqSiS3U84QH8KhW3E&usqp=CAU"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://upanh123.com/wp-content/uploads/2021/05/hinh-nen-doremon2-683x1024.jpg"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://ichef.bbci.co.uk/images/ic/480xn/p09f3ldp.jpg.webp"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://genk.mediacdn.vn/2016/6-1476522724062.jpg"
            />
          </Tooltip>
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
        <BoardMenu />
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
