// ViewPermissionsDialog.js

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
import React from "react";

const ViewPermissionsDialog = ({ open, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Khả năng xem</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="h6">Riêng tư</Typography>

          <FormControlLabel control={<Checkbox />} label="Riêng tư" />
        </Box>

        <Box>
          <Typography variant="h6">
            Thành viên trong Không gian làm việc
          </Typography>

          <FormControlLabel
            control={<Checkbox />}
            label="Không gian làm việc"
          />
        </Box>

        <Box>
          <Typography variant="h6">Tổ chức</Typography>

          <FormControlLabel control={<Checkbox />} label="Tổ chức" />
        </Box>

        <Box>
          <Typography variant="h6">Công khai</Typography>

          <FormControlLabel control={<Checkbox />} label="Công khai" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onClose}>Áp dụng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ViewPermissionsDialog;
