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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useParams, useNavigate } from "react-router-dom";
import { useGenerateInviteLink, useUpdateRoleMemberInBoards ,useRemoveMemberFromBoard } from "../../../../../../../hooks/useInviteBoard";
// import { useRemoveMemberFromBoard } from "../../../../../../../hooks/useRemoveMemberFromBoard"; // Import hook đã chỉnh sửa
import { toast } from "react-toastify";

const ShareBoardDialog = ({ currentUser, boardMembers, open, onClose }) => {
  const { boardId } = useParams();
  const currentBoardId = boardId;
  const navigate = useNavigate();

  console.log(currentUser);

  console.log('Current board:',boardMembers);

  

  // Hooks
  const { mutate: generateLink } = useGenerateInviteLink();
  const { mutate: updateRoleMemberInBoard } = useUpdateRoleMemberInBoards();
  const removeMember = useRemoveMemberFromBoard(currentUser?.id); // Sử dụng hook với currentUserId

  // States
  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [leaveAnchorEl, setLeaveAnchorEl] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [link, setLink] = useState("");
  const leaveButtonRef = useRef(null);

  // Handlers
  const handleOpenRoleMenu = (event, memberId) => {
    setRoleAnchorEl(event.currentTarget);
    setSelectedMemberId(memberId);
  };

  const handleCloseRoleMenu = (roleDisplay, memberId) => {
    if (!roleDisplay || !memberId) {
      setRoleAnchorEl(null);
      return;
    }

    const roleApi = {
      "Quản trị viên": "admin",
      "Thành viên": "member",
    }[roleDisplay] || null;

    const isRemoveAction = roleDisplay === "Rời bảng" || roleDisplay === "Xóa khỏi bảng";
    const isCreator = currentUser.id === boardMembers.data.find(m => m.id === memberId)?.creator_id;

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
                toast.error("Bạn không thể rời bảng khi không có quản trị viên khác!");
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

  const handleCloseLeaveMenu = (action) => {
    if (action === "Rời bảng") {
      setOpenLeaveDialog(true);
      setSelectedMemberId(currentUser.id);
    }
    setLeaveAnchorEl(null);
  };

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
  };

  // Utility functions
  const getMemberRoleText = (role) => (role === "admin" ? "Quản trị viên" : "Thành viên");
  const getMemberRoleDescription = (role) =>
    role === "admin" ? "Quản trị viên của bảng" : "Thành viên";

  // Kiểm tra số lượng admin
  const adminCount = boardMembers?.data?.filter((m) => m.pivot.role === "admin").length;
  console.log(adminCount);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Chia sẻ bảng</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Địa chỉ email hoặc tên"
          size="small"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": { borderRadius: 2 },
            "& input::placeholder": { fontSize: "0.765rem" },
            "& input": { fontSize: "0.675rem" },
          }}
        />

        <Box display="flex" alignItems="center">
          <FormControlLabel
            control={<Switch />}
            label="Chia sẻ bảng này bằng liên kết"
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": { color: "teal" },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "teal" },
            }}
          />
          <Typography variant="body2" color="teal" sx={{ cursor: "pointer", ml: 1 }} onClick={handleCreateLink}>
            Tạo liên kết
          </Typography>
        </Box>

        {link && (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            Liên kết: {link}
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Thành viên của bảng thông tin
        </Typography>

        {boardMembers?.data?.map((member) => {
          const isCurrentUser = currentUser?.id === member.id;
          // console.log(currentUser?.id)

          const currentUserBoard = currentUser?.boardMember?.find((board) => board.board_id === currentBoardId);

          // console.log("currentUser boardMember:", currentUser?.boardMember);

          const isAdmin = currentUserBoard?.role === "admin";
          const canEdit = isAdmin;
          const isSelectedAdmin = member?.pivot.role === "admin";
          const removeOptionText =
            isCurrentUser && adminCount > 1 ? "Rời bảng" : isSelectedAdmin ? "Rời bảng" : "Xóa khỏi bảng";

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
                <Typography fontWeight="bold">{member.full_name}</Typography>
                <Typography variant="body2" color="textSecondary">{member.email}</Typography>
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
                    open={Boolean(roleAnchorEl) && selectedMemberId === member.id}
                    onClose={() => handleCloseRoleMenu(null, member.id)}
                    MenuListProps={{ sx: { "& .MuiMenuItem-root": { fontSize: "0.8rem" } } }}
                  >
                    <MenuItem onClick={() => handleCloseRoleMenu("Quản trị viên", member.id)}>
                      Quản trị viên
                    </MenuItem>
                    <MenuItem onClick={() => handleCloseRoleMenu("Thành viên", member.id)}>Thành viên</MenuItem>
                    <MenuItem onClick={() => handleCloseRoleMenu(removeOptionText, member.id)}>
                      {removeOptionText}
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Typography variant="body2" sx={{ fontSize: "0.765rem", p: "4px 8px" }}>
                  {getMemberRoleText(member.pivot.role)}
                </Typography>
              )}
            </Box>
          );
        })}

        <Button ref={leaveButtonRef} sx={{ display: "none" }} />
        <Menu
          anchorEl={leaveAnchorEl}
          open={Boolean(leaveAnchorEl)}
          onClose={() => handleCloseLeaveMenu(null)}
          MenuListProps={{ sx: { "& .MuiMenuItem-root": { fontSize: "0.8rem" } } }}
        >
          <MenuItem onClick={() => handleCloseLeaveMenu("Rời bảng")}>Rời bảng</MenuItem>
        </Menu>

        <Dialog open={openLeaveDialog} onClose={() => setOpenLeaveDialog(false)}>
          <DialogTitle>Bạn có chắc chắn muốn rời bảng?</DialogTitle>
          <DialogContent>
            <Typography>
              Bạn sẽ mất quyền truy cập vào bảng sau khi rời. Hãy đảm bảo đã chỉ định ít nhất một quản trị viên khác.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenLeaveDialog(false)}>Hủy</Button>
            <Button onClick={handleLeaveBoard} color="error">Rời bảng</Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ShareBoardDialog;