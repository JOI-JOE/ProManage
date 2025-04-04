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
import { useGenerateInviteLink, useUpdateRoleMemberInBoards, useRemoveMemberFromBoard, useRemoveInviteLink } from "../../../../../../../hooks/useInviteBoard";
// import { useRemoveMemberFromBoard } from "../../../../../../../hooks/useRemoveMemberFromBoard"; // Import hook đã chỉnh sửa
import { toast } from "react-toastify";
import { useBoard } from "../../../../../../../contexts/BoardContext";

const ShareBoardDialog = ({ boardMembers, currentUser, open, onClose }) => {
  const { boardId } = useParams();
  const currentBoardId = boardId;
  const navigate = useNavigate();


  const [roleAnchorEl, setRoleAnchorEl] = useState(null);
  const [leaveAnchorEl, setLeaveAnchorEl] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [openLeaveDialog, setOpenLeaveDialog] = useState(false);
  const [link, setLink] = useState(null);
  const leaveButtonRef = useRef(null);

  // Hooks
  const { mutate: generateLink } = useGenerateInviteLink(setLink);
  const { mutate: removeInvite } = useRemoveInviteLink();
  const { mutate: updateRoleMemberInBoard } = useUpdateRoleMemberInBoards();
  const removeMember = useRemoveMemberFromBoard(currentUser?.id);

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
    setLink(localStorage.getItem("InviteLink"));
  };

  const handleDeleteLink = () => {

    const inviteCode = link.split("/").pop();
    removeInvite(inviteCode, {
      onSuccess: () => {
        toast.success("Đã xóa liên kết mời!");
        localStorage.removeItem("InviteLink"); // Xóa khỏi localStorage
        setLink(null);
      }
    });
  };

  // Utility functions
  const getMemberRoleText = (role) => (role === "admin" ? "Quản trị viên" : "Thành viên");
  const getMemberRoleDescription = (role) =>
    role === "admin" ? "Quản trị viên của bảng" : "Thành viên";

  const checkUser = boardMembers.filter(member => member.id === currentUser?.id);

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
          {link ? (
            <Typography variant="body2" color="red" sx={{ cursor: "pointer", ml: 1 }} onClick={handleDeleteLink}>
              Xóa liên kết
            </Typography>
          ) : (
            <Typography variant="body2" color="blue" sx={{ cursor: "pointer", ml: 1 }} onClick={handleCreateLink}>
              Tạo liên kết
            </Typography>
          )}
        </Box>

        {link && (
          <Typography variant="body2" color="textSecondary" sx={{ cursor: "pointer", ml: 1, color: "blue" }} onClick={() => navigator.clipboard.writeText(link)}>
            Sao chép liên kết
          </Typography>
        )}

        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
          Thành viên của bảng thông tin
        </Typography>

        {boardMembers?.map((member) => {

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
                src={member?.image || ""}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "#1976d2",
                  fontSize: "16px",
                  fontWeight: "bold",
                }}
              >
                {member?.image || member?.full_name.charAt(0).toUpperCase()}
              </Avatar>
              <Box flexGrow={1}>
                <Typography fontWeight="bold">{member.full_name}</Typography>
                <Typography variant="body2" color="textSecondary">{member.email}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {getMemberRoleDescription(member.role)}
                </Typography>
              </Box>

              <>
                <Button
                  variant="outlined"
                  size="small"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => handleOpenRoleMenu(e, member.id)}
                  sx={{ fontSize: "0.765rem" }}
                  disabled={member.role === "normal"}
                >
                  {getMemberRoleText(member.role)}
                </Button>
                <Menu
                  anchorEl={roleAnchorEl}
                  open={Boolean(roleAnchorEl) && selectedMemberId === member.id}
                  onClose={() => handleCloseRoleMenu(null, member.id)}
                  MenuListProps={{
                    sx: {
                      "& .MuiMenuItem-root": {
                        fontSize: "0.8rem", // Điều chỉnh kích thước font
                        padding: "8px 20px", // Điều chỉnh padding nếu cần
                      },
                      "& .MuiPaper-root": {
                        minWidth: "200px", // Điều chỉnh độ rộng của Menu
                        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Thêm hiệu ứng bóng cho Menu
                      },
                    },
                  }}
                  anchorOrigin={{
                    vertical: "bottom", // Điều chỉnh vị trí của menu theo chiều dọc
                    horizontal: "right", // Điều chỉnh vị trí của menu theo chiều ngang
                  }}
                  transformOrigin={{
                    vertical: "top", // Đặt vị trí gốc của menu theo chiều dọc
                    horizontal: "right", // Đặt vị trí gốc của menu theo chiều ngang
                  }}
                  sx={{
                    mt: 1, // Dịch xuống dưới 20px
                  }}
                >
                  {{
                    // checkUser.role === "admin" ?
                    //   (
                    //     <MenuItem onClick={() => handleCloseRoleMenu("Quản trị viên", member.id)}>
                    //     Quản trị viên
                    //   </MenuItem>
                    //   <MenuItem onClick={() => handleCloseRoleMenu("Thành viên", member.id)}>
                    //     Thành viên
                    //   </MenuItem>
                    //   <MenuItem onClick={() => handleLeaveBoard("Rời khỏi", member.id)}>
                    //     Ra ngoài
                    //   </MenuItem>
                    //   ) : (
                    //     <MenuItem onClick={() => handleCloseRoleMenu("Quản trị viên", member.id)} disabled={true}>
                    //     Quản trị viên
                    //   </MenuItem>
                    //   <MenuItem onClick={() => handleCloseRoleMenu("Thành viên", member.id)}  disabled={true}>
                    //     Thành viên
                    //   </MenuItem>
                    //   <MenuItem onClick={() => handleLeaveBoard("Rời khỏi", member.id)}>
                    //     Ra ngoài
                    //   </MenuItem>
                    //   )
                  }}

                </Menu>
              </>
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