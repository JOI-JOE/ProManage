import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { useUpdateBoardVisibility } from "../../../../../../../hooks/useBoard";
import { useParams } from "react-router-dom";

const ViewPermissionsDialog = ({ open, onClose , initialVisibility }) => {
  const { boardId } = useParams(); // ✅ Lấy boardId từ URL
  const [selectedVisibility, setSelectedVisibility] = useState(initialVisibility);
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
        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedVisibility === "private"}
                onChange={handleChange}
                value="private"
              />
            }
            label="Riêng tư"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedVisibility === "workspace"}
                onChange={handleChange}
                value="workspace"
              />
            }
            label="Không gian làm việc"
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Checkbox
                checked={selectedVisibility === "public"}
                onChange={handleChange}
                value="public"
              />
            }
            label="Công khai"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleApply} disabled={updateVisibilityMutation.isLoading}>
          {updateVisibilityMutation.isLoading ? "Đang cập nhật..." : "Áp dụng"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPermissionsDialog;
