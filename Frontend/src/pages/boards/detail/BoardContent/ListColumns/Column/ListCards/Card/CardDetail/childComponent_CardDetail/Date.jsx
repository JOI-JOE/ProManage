import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Checkbox,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const DateModal = ({ open, onClose, onSave }) => {
  const [isStartDateChecked, setIsStartDateChecked] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [endTime, setEndTime] = useState(dayjs().startOf("day"));
  const [reminder, setReminder] = useState("1 ngày trước");

  // Reset giá trị khi mở modal
  useEffect(() => {
    if (open) {
      setStartDate(null);
      setEndDate(dayjs().startOf("day"));
      setEndTime(dayjs().startOf("day"));
    }
  }, [open]);

  // Đảm bảo ngày bắt đầu luôn <= ngày kết thúc
  useEffect(() => {
    if (isStartDateChecked && startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        setEndDate(startDate.add(1, "day"));
      }
    }
  }, [startDate, endDate]);

  // Lưu dữ liệu
  const handleSave = () => {
    const data = {
      startDate: isStartDateChecked
        ? startDate?.format("DD/MM/YYYY")
        : "Không có",
      endDate: isEndDateChecked ? endDate?.format("DD/MM/YYYY") : "Không có",
      endTime: isEndDateChecked ? endTime?.format("HH:mm") : "Không có",
      reminder,
    };

    console.log("Dữ liệu được gửi về CardModal:", data);
    onSave(data);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "350px",
          padding: "5px",
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: "bold", pb: 3, position: "relative" }}>
        Ngày
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "gray",
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Ngày bắt đầu */}
      <Box sx={{ paddingX: 1, mb: 0.5 }}>
        <Typography sx={{ fontWeight: "bold" }}>Ngày bắt đầu</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Checkbox
            size="small"
            checked={isStartDateChecked}
            onChange={(e) => {
              setIsStartDateChecked(e.target.checked);
              setStartDate(e.target.checked ? dayjs() : null);
            }}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disabled={!isStartDateChecked}
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              )}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Ngày kết thúc */}
      <Box sx={{ paddingX: 1, mb: 0.5 }}>
        <Typography sx={{ fontWeight: "bold" }}>Ngày kết thúc</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Checkbox
            size="small"
            checked={isEndDateChecked}
            onChange={(e) => setIsEndDateChecked(e.target.checked)}
          />
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              disabled={!isEndDateChecked}
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  variant="outlined"
                  size="small"
                />
              )}
            />
            <TimePicker
              disabled={!isEndDateChecked}
              value={endTime}
              onChange={(newTime) => setEndTime(newTime)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  sx={{ width: 50 }}
                />
              )}
            />
          </LocalizationProvider>
        </Box>
      </Box>

      {/* Nhắc nhở */}
      <Box sx={{ paddingX: 1, mb: 3, pt: 2 }}>
        <Typography sx={{ fontWeight: "bold" }}>Thiết lập Nhắc nhở</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={reminder}
            onChange={(e) => setReminder(e.target.value)}
            sx={{ height: 32 }}
            MenuProps={{
              anchorOrigin: { vertical: "top", horizontal: "left" },
              transformOrigin: { vertical: "bottom", horizontal: "left" },
              getContentAnchorEl: null,
            }}
          >
            <MenuItem value="Không có">Không có</MenuItem>
            <MenuItem value="Vào thời điểm ngày hết hạn">
              Vào thời điểm ngày hết hạn
            </MenuItem>
            <MenuItem value="5 phút trước">5 Phút trước</MenuItem>
            <MenuItem value="10 phút trước">10 Phút trước</MenuItem>
            <MenuItem value="15 phút trước">15 Phút trước</MenuItem>
            <MenuItem value="1 giờ trước">1 Giờ trước</MenuItem>
            <MenuItem value="2 giờ trước">2 Giờ trước</MenuItem>
            <MenuItem value="1 ngày trước">1 Ngày trước</MenuItem>
            <MenuItem value="2 ngày trước">2 Ngày trước</MenuItem>
          </Select>
        </FormControl>
        <Typography sx={{ fontSize: "12px", color: "gray" }}>
          Nhắc nhở sẽ được gửi đến tất cả các thành viên và người theo dõi thẻ
          này.
        </Typography>
      </Box>

      {/* Nút Lưu */}
      <DialogActions sx={{ justifyContent: "center", pb: 1 }}>
        <Button
          onClick={handleSave}
          color="primary"
          variant="contained"
          size="small"
        >
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateModal;
