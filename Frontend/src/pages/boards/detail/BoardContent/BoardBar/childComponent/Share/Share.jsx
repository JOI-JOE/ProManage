import React, { useRef, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Avatar,
  Menu,
  MenuItem,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGenerateInviteLink,
  useUpdateRoleMemberInBoards,
  useRemoveMemberFromBoard,
  useRemoveInviteLink,
  useGetRequestBoard,
  useAcceptRequestJoinBoard,
  useJoinBoardRequestListener,
  useRejectRequestJoinBoard,
} from "../../../../../../../hooks/useInviteBoard";
// import { useRemoveMemberFromBoard } from "../../../../../../../hooks/useRemoveMemberFromBoard"; // Import hook đã chỉnh sửa
import { toast } from "react-toastify";
import { inviteMemberIntoBoardByEmail } from "../../../../../../../api/models/inviteBoardApi";

const ShareBoardDialog = ({ currentUser, boardMembers, open, onClose }) => {
  const { boardId } = useParams();
  const currentBoardId = boardId;
  const navigate = useNavigate();

  // console.log(currentUser);

  // console.log('Current board:',boardMembers);
  // States

  const [tabIndex, setTabIndex] = useState(0);
  const [joinRequests, setJoinRequests] = useState([]); // Danh sách yêu cầu tham gia
  const [openRoleMenu, setOpenRoleMenu] = useState(false);
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [leaveAnchorEl, setLeaveAnchorEl] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [link, setLink] = useState(null);
  const leaveButtonRef = useRef(null);
  const [emailInput, setEmailInput] = useState(""); // Lưu email nhập vào
  const [emailList, setEmailList] = useState([]); // Lưu danh sách email hợp lệ
  const [hasFetchedRequest, setHasFetchedRequest] = useState(false);

  // Hooks
  const { mutate: generateLink } = useGenerateInviteLink(setLink);
  const { mutate: removeInvite } = useRemoveInviteLink();
  const { mutate: acceptRequestJoinBoard } = useAcceptRequestJoinBoard();
  const { mutate: rejectRequestJoinBoard } = useRejectRequestJoinBoard();
  const { mutate: updateRoleMemberInBoard } = useUpdateRoleMemberInBoards();
  const removeMember = useRemoveMemberFromBoard(currentUser?.id); // Sử dụng hook với currentUserId
  useJoinBoardRequestListener(currentUser?.id);

  

// useEffect(() => {
//   if (tabIndex === 1 && !hasFetchedRequest) {
//     setHasFetchedRequest(true);
//   }
// }, [tabIndex]);
const [requestList, setRequestList] = useState([]);
const { data: requests } = useGetRequestBoard(boardId);

useEffect(() => {
  if (requests?.data) {
    setRequestList(requests.data);
  
  }
  
}, [requests]);
// console.log(requestList);

const handleAcceptRequest = (requestId) => {
  try {
    acceptRequestJoinBoard(requestId)
  
      setRequestList((prevList) =>
        prevList.filter((request) => request.id !== requestId)
      );
      // toast.success("Chấp nhận yêu cầu tham gia thành công!");
  } catch (error) {
     console.error('Lỗi khi chấp nhận yêu cầu:', error);
  }
  
}
const handleRejectRequest = (requestId) => {
  try {
    rejectRequestJoinBoard(requestId)
  
    setRequestList((prevList) =>
      prevList.filter((request) => request.id !== requestId)
    );
      // toast.success("Chấp nhận yêu cầu tham gia thành công!");
  } catch (error) {
     console.error('Lỗi khi xóa yêu cầu:', error);
  }
}

  

  // Handlers
  const handleOpenRoleMenu = (event, memberId) => {
    setRoleAnchorEl(event.currentTarget);
    setSelectedMemberId(memberId);
  };

  const handleEmailChange = (event) => {
    setEmailInput(event.target.value);
  };

  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault(); // Ngăn form submit mặc định

      const email = emailInput.trim();

      if (!email) return;

      if (email === currentUser.email) {
        toast.error("Không thể mời chính bạn!");
        return;
      }

      if (!isValidEmail(email)) {
        toast.error("Email không hợp lệ!");
        return;
      }

      if (emailList.includes(email)) {
        toast.error("Email đã tồn tại trong danh sách!");
        return;
      }

      setEmailList([...emailList, email]);
      setEmailInput(""); // Reset input
    }
  };

  const removeEmail = (emailToRemove) => {
    setEmailList(emailList.filter((email) => email !== emailToRemove));
  };

  const handleInvite = async () => {
    if (!emailList.length) {
      toast.warn("Không có email nào để mời.");
      return;
    }

    const data = {
      board_id: currentBoardId, // bạn cần truyền ID của bảng hiện tại
      emails: emailList,
      message: `Bạn đã được mời tham gia bảng`, // tuỳ biến nội dung
    };

    try {
      const res = await inviteMemberIntoBoardByEmail(data);
      console.log("Mời thành viên thành công:", res);

      // Xử lý sau khi mời xong
      setEmailList([]); // reset danh sách email
      toast.success("Đã gửi lời mời thành công!");
    } catch (error) {
      console.error("Lỗi khi gửi lời mời:", error);
      toast.error("Gửi lời mời thất bại.");
    }
  };

  const handleCloseRoleMenu = (roleDisplay, memberId) => {
    if (!roleDisplay || !memberId) {
      setRoleAnchorEl(null);
      return;
    }

    const roleApi =
      {
        "Quản trị viên": "admin",
        "Thành viên": "member",
      }[roleDisplay] || null;

    const isRemoveAction =
      roleDisplay === "Rời bảng" || roleDisplay === "Xóa khỏi bảng";
    const isCreator =
      currentUser.id ===
      boardMembers.data.find((m) => m.id === memberId)?.creator_id;

    if (isRemoveAction) {
      if (isCreator) {
        setOpenLeaveDialog(true);
        setSelectedMemberId(memberId);
      } else {
        removeMember.mutate(
          { boardId: currentBoardId, userId: memberId },
          {
            onError: (error) => {
              if (error.message.includes("last admin")) {
                toast.error(
                  "Bạn không thể rời bảng khi không có quản trị viên khác!"
                );
              }
            },
          }
        );
      }
    } else if (roleApi) {
      updateRoleMemberInBoard(
        { boardId: currentBoardId, userId: memberId, role: roleApi },
        {
          onSuccess: (data) => {
            if (isCreator && roleApi === "admin" && data.can_leave) {
              setLeaveAnchorEl(leaveButtonRef.current);
            }
          },
          onError: (error) => {
            if (error.message.includes("last admin")) {
              toast.error("Phải có ít nhất 1 quản trị viên!");
            }
          },
        }
      );
    }
    setRoleAnchorEl(null);
  };

  // const handleCloseLeaveMenu = (action) => {
  //   if (action === "Rời bảng") {
  //     setOpenLeaveDialog(true);
  //     setSelectedMemberId(currentUser.id);
  //   }
  //   setLeaveAnchorEl(null);
  // };

  const handleLeaveBoard = () => {
    removeMember.mutate(
      { boardId: currentBoardId, userId: selectedMemberId },
      {
        onSuccess: () => {
          setOpenLeaveDialog(false);
          if (selectedMemberId === currentUser.id) {
            navigate("/home"); // Điều hướng về home nếu người dùng tự rời
          }
        },
      }
    );
  };

  const handleCreateLink = () => {
    generateLink(currentBoardId);
    setLink(localStorage.getItem("InviteLink"));
  };

  const handleDeleteLink = () => {
    const inviteCode = link.split("/").pop();
    removeInvite(inviteCode, {
      onSuccess: () => {
        toast.success("Đã xóa liên kết mời!");
        localStorage.removeItem("InviteLink"); // Xóa khỏi localStorage
        setLink(null);
      },
    });
  };

  // Utility functions
  const getMemberRoleText = (role) =>
    role === "admin" ? "Quản trị viên" : "Thành viên";
  const getMemberRoleDescription = (role) =>
    role === "admin" ? "Quản trị viên của bảng" : "Thành viên";

  // Kiểm tra số lượng admin
  const adminCount = boardMembers?.data?.filter(
    (m) => m.pivot.role === "admin"
  ).length;
  // console.log(adminCount);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chia sẻ bảng</DialogTitle>
      <DialogContent>
        {/* Phần nhập email và nút Chia sẻ */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
              {/* Danh sách email với Chip */}
              {emailList.length > 0 && (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
                  {emailList.map((email, index) => (
                    <Chip
                      key={index}
                      label={email}
                      onDelete={() => removeEmail(email)}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              )}
              {/* Input nhập email */}
              <TextField
                variant="outlined"
                placeholder="Vui lòng nhập email muốn mời"
                size="small"
                multiline
                rows={1}
                value={emailInput}
                onChange={handleEmailChange}
                onKeyDown={handleKeyDown}
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": { borderRadius: 2 },
                  "& input::placeholder": { fontSize: "0.875rem" },
                  "& input": { fontSize: "0.875rem" },
                }}
              />
            </Box>
            {/* Nút Chia sẻ */}
            <Button
              variant="contained"
              color="primary"
              size="medium"
              onClick={handleInvite}
              sx={{ minWidth: "100px", mt: emailList.length > 0 ? 3.5 : 0 }}
            >
              Mời
            </Button>
          </Box>
        </Box>

        {/* Phần tạo/xóa liên kết */}
        <Box sx={{ mb: 3 }}>
          {/* <Typography variant="subtitle1" gutterBottom>
            Liên kết chia sẻ
          </Typography> */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {link ? (
              <>
                <Button
                  variant="contained"
                  color="error"
                  size="medium"
                  onClick={handleDeleteLink}
                  sx={{ minWidth: "120px" }}
                >
                  Xóa liên kết
                </Button>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: "pointer" }}
                  onClick={() => navigator.clipboard.writeText(link)}
                >
                  Sao chép liên kết
                </Typography>
              </>
            ) : (
              <Button
                variant="contained"
                color="primary"
                size="medium"
                onClick={handleCreateLink}
                sx={{ minWidth: "120px" }}
              >
                Tạo liên kết mời thành viên
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabIndex}
          onChange={(_, newIndex) => setTabIndex(newIndex)}
          sx={{
            "& .MuiTab-root": { fontSize: "0.875rem" }, // Cỡ chữ chung cho tất cả các tab
            "& .Mui-selected": { fontWeight: "bold" }, // Làm đậm tab đang chọn
          }}
        >
          <Tab
            label={`Thành viên (${boardMembers?.data?.length || 0})`}
            sx={{ fontSize: "0.9rem", textTransform: "none" }} // Riêng tab này
          />
          <Tab
            label={`Yêu cầu tham gia (${requestList.length || 0})`}
            sx={{ fontSize: "0.9rem", textTransform: "none" }}
          />
        </Tabs>

        {/* Danh sách thành viên */}
        {tabIndex === 0 && (
          <Box>
            {boardMembers?.data?.map((member) => {
              const isCurrentUser = currentUser?.id === member.id;
              const currentUserBoard = currentUser?.boardMember?.find(
                (board) => board.board_id === currentBoardId
              );
              const isAdmin = currentUserBoard?.role === "admin";
              const canEdit = isAdmin;
              const isSelectedAdmin = member?.pivot.role === "admin";
              // Kiểm tra xem người dùng hiện tại có phải là người tạo bảng không
              const isCreator = currentUser?.id === member?.creator_id; // Giả sử member có thuộc tính creator_id

              const removeOptionText =
                isCurrentUser && adminCount > 1 && isCreator
                  ? "Rời bảng" // Người tạo bảng rời khi có quản trị viên khác
                  : isCurrentUser && !isCreator && isAdmin
                    ? "Rời bảng" // Quản trị viên được ủy quyền rời bảng
                    : isSelectedAdmin && !isCreator
                      ? "Xóa khỏi bảng" // Quản trị viên được ủy quyền xóa thành viên khác
                      : "Xóa khỏi bảng"; // Mặc định cho thành viên thường

              return (
                <Box
                  key={member.id}
                  display="flex"
                  alignItems="center"
                  gap={2}
                  mt={1}
                  sx={{ p: 1, borderRadius: 2, backgroundColor: "#E8CC9F" }}
                >
                  <Avatar
                    alt={member.full_name}
                    src={member.avatar || ""}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "#1976d2",
                      fontSize: "16px",
                      fontWeight: "bold",
                    }}
                  >
                    {!member.avatar && member.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography fontWeight="bold">
                      {member.full_name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {member.email}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {getMemberRoleDescription(member.pivot.role)}
                    </Typography>
                  </Box>

                  {canEdit ? (
                    <>
                      <Button
                        variant="outlined"
                        size="small"
                        endIcon={<ExpandMoreIcon />}
                        onClick={(e) => handleOpenRoleMenu(e, member.id)}
                        sx={{ fontSize: "0.765rem" }}
                      >
                        {getMemberRoleText(member.pivot.role)}
                      </Button>
                      <Menu
                        anchorEl={roleAnchorEl}
                        open={
                          Boolean(roleAnchorEl) &&
                          selectedMemberId === member.id
                        }
                        onClose={() => handleCloseRoleMenu(null, member.id)}
                        MenuListProps={{
                          sx: { "& .MuiMenuItem-root": { fontSize: "0.8rem" } },
                        }}
                      >
                        <MenuItem
                          onClick={() =>
                            handleCloseRoleMenu("Quản trị viên", member.id)
                          }
                        >
                          Quản trị viên
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            handleCloseRoleMenu("Thành viên", member.id)
                          }
                        >
                          Thành viên
                        </MenuItem>
                        <MenuItem
                          onClick={() =>
                            handleCloseRoleMenu(removeOptionText, member.id)
                          }
                        >
                          {removeOptionText}
                        </MenuItem>
                      </Menu>
                    </>
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.765rem", p: "4px 8px" }}
                    >
                      {getMemberRoleText(member.pivot.role)}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Box>
        )}

        {/* Danh sách yêu cầu tham gia */}
        {tabIndex === 1 && (
          <Box>
            {requestList.length > 0 ? (
              requestList.map((request) => (
                <Box
                  key={request.id}
                  display="flex"
                  alignItems="center"
                  mt={1}
                  p={1}
                  borderRadius={2}
                  bgcolor="#f5f5f5"
                >
                  <Avatar
                    src={request.avatar || ""}
                    sx={{ width: 40, height: 40, mr: 2 }}
                  >
                    {!request.avatar &&
                      request.full_name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box flexGrow={1}>
                    <Typography fontWeight="bold">
                      {request.full_name} 
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {request.email}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={() => handleAcceptRequest(request.id)}
                  >
                    Chấp nhận
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    onClick={() => handleRejectRequest(request.id)}
                    sx={{ ml: 1 }}
                  >
                    Từ chối
                  </Button>
                </Box>
              ))
            ) : (
              <Typography mt={2} textAlign="center">
                Không có yêu cầu tham gia.
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ShareBoardDialog;
