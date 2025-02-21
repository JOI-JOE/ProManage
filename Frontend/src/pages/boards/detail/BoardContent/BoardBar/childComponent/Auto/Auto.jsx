// AutomationDialog.js

import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Typography,
  FormControlLabel,
  Checkbox,
  Chip,
  Button,
} from "@mui/material";
import React from "react";

const AutomationDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Tự động hóa</DialogTitle>
      <DialogContent>
        <Typography variant="h6">Quy tắc</Typography>
        <Typography variant="body2">
          Tạo các quy tắc tự động phản hồi các thao tác, lịch hoặc ngày đến hạn
          của thẻ.
        </Typography>
        <FormControlLabel control={<Checkbox />} label="Tạo quy tắc tự động" />

        <Typography variant="h6">Các nút</Typography>
        <Typography variant="body2">
          Tạo các nút tùy chỉnh ở mặt sau của mỗi thẻ hoặc ở đâu bảng.
        </Typography>
        <FormControlLabel control={<Checkbox />} label="Tạo nút" />

        <Typography variant="h6">Báo cáo email</Typography>
        <Typography variant="body2">
          Thiết lập báo cáo qua email, chẳng hạn như bản tóm tắt hàng tuần về
          tất cả các thẻ đến hạn trong vòng 7 ngày.
        </Typography>
        <FormControlLabel control={<Checkbox />} label="Báo cáo email" />

        <Typography variant="h6">Gửi phản hồi</Typography>
        <Typography variant="body2">
          Giúp chúng tôi cải thiện tự động hóa của bạn.
        </Typography>
        <FormControlLabel control={<Checkbox />} label="Gửi phản hồi" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onClose}>Áp dụng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutomationDialog;
