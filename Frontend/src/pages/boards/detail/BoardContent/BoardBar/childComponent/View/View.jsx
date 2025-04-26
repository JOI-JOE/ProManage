import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  Box,
  Button,
} from "@mui/material";
import React, { useState, useEffect, useMemo } from "react";
import { useUpdateBoardVisibility } from "../../../../../../../hooks/useBoard";
import { useGetBoardByID } from "../../../../../../../hooks/useBoard"; // Import hook để lấy thông tin bảng
import { useParams } from "react-router-dom";
import LockIcon from "@mui/icons-material/Lock"; // Icon cho Riêng tư
import GroupIcon from "@mui/icons-material/Group"; // Icon cho Không gian làm việc
import PublicIcon from "@mui/icons-material/Public"; // Icon cho Công khai
import { useGetBoardMembers } from "../../../../../../../hooks/useInviteBoard";
import { useMe } from "../../../../../../../contexts/MeContext";

const ViewPermissionsDialog = ({ open, onClose }) => {
  const { boardId } = useParams(); // Lấy boardId từ URL

  // Sử dụng hook useGetBoardByID để lấy thông tin bảng
  const { data: board, isLoading, error } = useGetBoardByID(boardId);

  // Khởi tạo selectedVisibility với giá trị mặc định là "private"
  const [selectedVisibility, setSelectedVisibility] = useState("private");
  const { data: boardMembers = [] } = useGetBoardMembers(boardId);
  const {  user, boardIds } = useMe();

  const currentUserId = user?.id;

 const isAdminBoard = useMemo(() => {
    const boardInfo = boardIds?.find((b) => b.id === board?.id);
    return boardInfo?.is_admin || boardInfo?.role === 'admin';
  }, [boardIds, boardId, boardIds?.find(b => b.id === board?.id)?.role]);
    // console.log("boardIds", isAdminBoard);
    

  const isAdmin = Array.isArray(boardMembers?.data)
    ? boardMembers.data.some(member =>
      member.id === currentUserId && member.pivot.role === "admin"
    )
    : false;


  // Cập nhật selectedVisibility khi dữ liệu bảng được tải
  useEffect(() => {
    if (board && board.visibility) {
      setSelectedVisibility(board.visibility);
    }
  }, [board]);

  const updateVisibilityMutation = useUpdateBoardVisibility();

  const handleChange = (event) => {
    setSelectedVisibility(event.target.value);
  };

  const handleApply = async () => {
    if (!boardId) {
      console.error("Lỗi: boardId bị undefined!");
      return;
    }

    try {
      await updateVisibilityMutation.mutateAsync({ boardId, visibility: selectedVisibility });
      onClose();
    } catch (error) {
      console.error("Lỗi cập nhật visibility:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Khả năng xem</DialogTitle>
      <DialogContent>
        {isLoading ? (
          <Typography>Đang tải thông tin bảng...</Typography>
        ) : error ? (
          <Typography color="error">Lỗi khi tải thông tin bảng!</Typography>
        ) : (
          <RadioGroup value={selectedVisibility} onChange={handleChange}>
            {/* Riêng tư */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                value="private"
                control={<Radio />}
                disabled={!isAdminBoard}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <LockIcon sx={{ mr: 1, color: "red" }} />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Riêng tư
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="body2" sx={{ ml: 4, color: "gray" }}>
                Chỉ thành viên trong bảng thông tin mới có quyền xem bảng thông tin
                nay. Quản trị viên không gian làm việc có thể đóng bảng thông tin
                hoặc xóa thành viên.
              </Typography>
            </Box>

            {/* Không gian làm việc */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                value="workspace"
                control={<Radio />}
                disabled={!isAdminBoard}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <GroupIcon sx={{ mr: 1, color: "blue" }} />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Không gian làm việc
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="body2" sx={{ ml: 4, color: "gray" }}>
                Tất cả thành viên của Không gian làm việc ygc có thể xem và sửa
                bảng thông tin này.
              </Typography>
            </Box>

            {/* Công khai */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                value="public"
                control={<Radio />}
                disabled={!isAdminBoard}
                label={
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <PublicIcon sx={{ mr: 1, color: "green" }} />
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      Công khai
                    </Typography>
                  </Box>
                }
              />
              <Typography variant="body2" sx={{ ml: 4, color: "gray" }}>
                Bất kỳ ai trên mạng internet đều có thể xem bảng thông tin này.
                Chỉ thành viên trong bảng thông tin mới có quyền sửa.
              </Typography>
            </Box>
          </RadioGroup>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleApply} disabled={!isAdmin || updateVisibilityMutation.isLoading || isLoading}>
          {updateVisibilityMutation.isLoading ? "Đang cập nhật..." : "Áp dụng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPermissionsDialog;