import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Popover,
  Avatar,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useMe } from "../../../../../contexts/MeContext";
import { useChangeMemberType, useRemoveMember } from "../../../../../hooks/useWorkspace";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar";

const MemberItem = ({ member, boards = [], workspace, isAdmin }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });
  const [isRemoving, setIsRemoving] = useState(false); // Thêm state cho loading khi xóa

  const { user } = useMe();

  const { mutate: changeMemberType, isLoading: isChangingType } = useChangeMemberType();
  const { mutate: removeMember } = useRemoveMember();

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);
  const open = Boolean(anchorEl);
  const id = open ? "simple-popover" : undefined;

  const isMe = user?.id === member?.user_id;

  const adminCount = workspace?.members?.filter((m) => m.member_type === "admin").length || 0;
  const isSoleAdmin = isMe && member.member_type === "admin" && adminCount <= 1;

  const memberBoards = Array.isArray(boards)
    ? boards.filter((board) =>
      board.members.some((bm) => bm.user_id === member.user_id)
    )
    : [];

  const handleChangeMemberType = (event) => {
    const newType = event.target.value;
    changeMemberType(
      {
        workspaceId: workspace.id,
        userId: member.user_id,
        memberType: newType,
      },
      {
        onSuccess: () => {
          setAlert({
            open: true,
            message: `Đã thay đổi vai trò của ${member.user.full_name} thành ${newType === 'admin' ? 'Quản trị viên' : 'Thành viên'}`,
            severity: 'success'
          });
        },
        onError: (error) => {
          setAlert({
            open: true,
            message: error.response?.data?.message || 'Không thể thay đổi vai trò. Vui lòng thử lại.',
            severity: 'error'
          });
          console.error("Lỗi khi thay đổi vai trò:", error);
        },
      }
    );
  };

  const handleOpenRemoveDialog = () => {
    setRemoveDialogOpen(true);
  };

  const handleCloseRemoveDialog = () => {
    setRemoveDialogOpen(false);
  };

  const handleConfirmRemove = () => {
    // Prevent the sole admin from leaving
    if (isSoleAdmin) {
      setAlert({
        open: true,
        message: 'Không thể rời khỏi! Không gian làm việc phải có ít nhất một quản trị viên.',
        severity: 'error'
      });
      handleCloseRemoveDialog();
      return;
    }

    setIsRemoving(true); // Bật trạng thái loading

    removeMember(
      {
        workspaceId: workspace.id,
        userId: member.user_id,
        moveType: 'member'
      },
      {
        onSuccess: () => {
          setAlert({
            open: true,
            message: `Đã ${isMe ? 'rời khỏi' : 'xóa'} thành viên ${member.user.full_name} thành công!`,
            severity: 'success'
          });
          setIsRemoving(false); // Tắt trạng thái loading
          handleCloseRemoveDialog();

          if (isMe) {
            window.location.href = `/u/${user?.username || user?.id}/boards`;
          }
        },
        onError: (error) => {
          setAlert({
            open: true,
            message: error.response?.data?.message || `Không thể ${isMe ? 'rời khỏi' : 'xóa'} thành viên. Vui lòng thử lại.`,
            severity: 'error'
          });
          setIsRemoving(false); // Tắt trạng thái loading
          console.error("Lỗi khi xóa thành viên:", error);
        },
      }
    );
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px",
        width: "100%",
        background: "#ffffff",
        marginBottom: "8px",
      }}
    >
      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>

      {/* Member info */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <InitialsAvatar
          name={member?.user?.full_name}
          avatarSrc={member?.user?.image}
          initial={member?.user?.initials}
          size={32}
        />
        <Box>
          <Typography fontWeight="bold" sx={{ color: "#172B4D" }}>
            {member?.user?.full_name || "Không xác định"}
          </Typography>
          <Typography variant="body2" sx={{ color: "gray" }}>
            {member?.user?.email || "Không có email"}
          </Typography>
        </Box>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* View boards button */}
        {/* <Button
          variant="contained"
          onClick={handleClick}
          size="small"
          sx={{
            fontSize: "0.7rem",
            padding: "2px 12px",
            borderRadius: "3px",
            backgroundColor: "#0079BF",
            color: "white",
            "&:hover": {
              backgroundColor: "#026AA7",
            },
          }}
        >
          Xem bảng ({memberBoards.length})
        </Button> */}

        <Button
          variant="outlined"
          size="small"
          sx={{
            textTransform: 'none',
            borderColor: '#EBEEF0',
            color: '#172B4D',
            '&:hover': { borderColor: '#D8DEE4' }
          }}
          onClick={handleClick}
        >
          Xem bằng thông tin  ({memberBoards.length})
        </Button>

        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
          <Box sx={{ p: 2, width: 250 }}>
            <Typography fontWeight="bold">Bảng thông tin</Typography>
            <Typography variant="body2">
              {member?.user?.full_name || "Không xác định"} là thành viên của:
            </Typography>
            {memberBoards.length > 0 ? (
              memberBoards.map((board) => (
                <Box
                  key={board.id}
                  sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}
                >
                  <Avatar src={board.thumbnail} sx={{ width: 30, height: 30 }} />
                  <Typography variant="body2">{board.name}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ mt: 1 }}>
                Chưa tham gia bảng nào
              </Typography>
            )}
          </Box>
        </Popover>

        {/* Member type control */}
        {isAdmin ? (
          <Select
            value={member.member_type}
            onChange={handleChangeMemberType}
            size="small"
            disabled={isChangingType || isSoleAdmin}
            sx={{
              fontSize: "0.7rem",
              borderRadius: "3px",
              minWidth: 120,
              color: "#172B4D",
            }}
          >
            <MenuItem value="admin">Quản trị viên</MenuItem>
            <MenuItem value="normal">Thành viên</MenuItem>
          </Select>
        ) : (
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              fontSize: "0.7rem",
              borderRadius: "3px",
              borderColor: "#DFE1E6",
              color: "#172B4D",
              padding: "2px 8px",
            }}
          >
            {member.member_type === 'admin' ? 'Quản trị viên' : member.member_type === 'normal' ? 'Thành viên' : 'Đang chờ'}
          </Button>
        )}

        {(isMe || isAdmin) && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={handleOpenRemoveDialog}
            disabled={isRemoving || (!isMe && !isAdmin) || isSoleAdmin}
            sx={{
              fontSize: "0.7rem",
              padding: "2px 12px",
              borderRadius: "3px",
              borderColor: "#FF5630",
              "&:hover": {
                borderColor: "#DE350B",
                backgroundColor: "#FFEBE6",
              },
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {isRemoving && <CircularProgress size={16} />}
            {isRemoving ? "Đang xử lý..." : (isMe ? "Rời khỏi" : "Loại bỏ")}
          </Button>
        )}
      </Box>

      {/* Confirmation Dialog for Removing Member */}
      <Dialog open={removeDialogOpen} onClose={handleCloseRemoveDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Xác nhận {isMe ? 'rời khỏi' : 'xóa'} thành viên</DialogTitle>
        <DialogContent>
          <Typography>
            Bạn có chắc chắn muốn {isMe ? 'rời khỏi' : 'xóa'}{" "}
            <strong>{member?.user?.full_name}</strong> khỏi không gian làm việc{" "}
            <strong>{workspace?.display_name}</strong> không?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseRemoveDialog}
            disabled={isRemoving}
            sx={{ color: "#172B4D" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRemove}
            color="error"
            variant="contained"
            disabled={isRemoving}
            sx={{
              minWidth: '120px',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            {isRemoving && <CircularProgress size={20} />}
            {isRemoving ? "Đang xử lý..." : (isMe ? "Rời khỏi" : "Xóa")}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MemberItem;