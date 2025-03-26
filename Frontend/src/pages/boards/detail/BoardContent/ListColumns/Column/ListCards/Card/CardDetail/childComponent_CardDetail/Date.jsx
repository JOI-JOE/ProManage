import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogActions,
  Button,
  Box,
  Checkbox,
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
import { useParams } from "react-router-dom";
import { useCardSchedule, useUpdateCardDate } from "../../../../../../../../../../hooks/useCard";

const DateModal = ({ open, onClose, onSave, initialData }) => {
  const { cardId } = useParams();
  // console.log("Parent component re-rendered!");
  const { data: schedule } = useCardSchedule(cardId, {
    staleTime: 60000, // Chỉ refetch sau 1 phút
    cacheTime: 300000, // Cache dữ liệu trong 5 phút
    enabled: !!cardId, // Chỉ gọi API nếu có cardId hợp lệ
  });
  // console.log(schedule);
  // const { data:batch } = useBatchData({ workspaceIds: [], boardIds: [], listIds: [], cardId });
  // console.log(batch)
  // const card = batch?.card;
  const { mutate: updateCardDate } = useUpdateCardDate();
  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [endTime, setEndTime] = useState(null);
  const [isStartDateChecked, setIsStartDateChecked] = useState(false);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  const [isEndTimeChecked, setIsEndTimeChecked] = useState(false);
  // const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  // const [endTime, setEndTime] = useState(dayjs().startOf("day"));
  const [reminder, setReminder] = useState("");


  // Load dữ liệu cũ khi mở modal
  useEffect(() => {
  
    if (schedule) {
     
        setIsStartDateChecked(!!schedule.start_date);
        setStartDate(schedule.start_date ? dayjs(schedule.start_date) : null);

        setIsEndDateChecked(!!schedule.end_date);
        setEndDate(schedule.end_date ? dayjs(schedule.end_date) : null);

        setIsEndTimeChecked(!!schedule.end_time);
        // setEndTime(schedule.end_time ? dayjs(schedule.end_time, "HH:mm") : null);
        setEndTime(schedule.end_time ? dayjs(schedule.end_time, "HH:mm") : null);

        // Nếu có reminder, tính khoảng thời gian so với `endDateTime`
        if (schedule.reminder && schedule.end_date && schedule.end_time) {
            const endDateTime = dayjs(`${schedule.end_date} ${schedule.end_time}`, "YYYY-MM-DD HH:mm");
            const reminderDateTime = dayjs(schedule.reminder, "YYYY-MM-DD HH:mm");
            const diff = endDateTime.diff(reminderDateTime, "minute");

            const reminderLabels = {
                0: "Vào thời điểm ngày hết hạn",
                5: "5 phút trước",
                10: "10 phút trước",
                15: "15 phút trước",
                60: "1 giờ trước",
                120: "2 giờ trước",
                1440: "1 ngày trước",
                2880: "2 ngày trước",
            };

            setReminder(reminderLabels[diff] || "Không có");
        } else {
            setReminder("Không có");
        }
    }
}, [schedule]);


  // Đảm bảo ngày bắt đầu luôn <= ngày kết thúc
  useEffect(() => {
    if (isStartDateChecked && startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        setEndDate(startDate.add(1, "day"));
      }
    }
  }, [startDate, endDate]);

  // Lưu dữ liệu
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
  
    if (!isEndDateChecked || !endDate || !endTime) {
        console.error("Ngày kết thúc chưa được chọn!");
        return;
    }
  
    let endDateTime = dayjs(`${endDate.format("YYYY-MM-DD")} ${endTime.format("HH:mm")}`);
  
    if (!endDateTime.isValid()) {
        console.error("Lỗi: Ngày giờ kết thúc không hợp lệ!");
        return;
    }
  
    let reminderDateTime = null;
    const reminderOptions = {
        "Không có": null,
        "Vào thời điểm ngày hết hạn": endDateTime,
        "5 phút trước": endDateTime.subtract(5, "minute"),
        "10 phút trước": endDateTime.subtract(10, "minute"),
        "15 phút trước": endDateTime.subtract(15, "minute"),
        "1 giờ trước": endDateTime.subtract(1, "hour"),
        "2 giờ trước": endDateTime.subtract(2, "hour"),
        "1 ngày trước": endDateTime.subtract(1, "day"),
        "2 ngày trước": endDateTime.subtract(2, "day"),
    };
  
    reminderDateTime = reminderOptions[reminder] || null;
  
    const formattedStartDate = isStartDateChecked && startDate ? startDate.format("YYYY-MM-DD") : null;
    const formattedEndDate = isEndDateChecked && endDate ? endDate.format("YYYY-MM-DD") : null;
    const formattedEndTime = isEndDateChecked && endTime ? endTime.format("HH:mm") : null;
    const formattedReminder = reminderDateTime ? reminderDateTime.format("YYYY-MM-DD HH:mm") : null;
    // console.log(formattedReminder);
  
     updateCardDate({ 
        cardId, 
        startDate: formattedStartDate, 
        endDate: formattedEndDate, 
        endTime: formattedEndTime, 
        reminder: formattedReminder,
    });
  
    onClose();
  }, [
    isEndDateChecked, endDate, endTime, reminder, 
    isStartDateChecked, startDate, cardId, 
    updateCardDate, onClose
  ]);

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
      <DialogTitle
        sx={{
          fontWeight: "bold",
          pb: 3,
          position: "relative",
          textAlign: "center",
          fontSize: "17px",
        }}
      >
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
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <DatePicker
              disabled={!isStartDateChecked}
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              format="DD/MM/YYYY" // Định dạng ngày/tháng/năm
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
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
          <DatePicker
            disabled={!isEndDateChecked}
            value={endDate}
            onChange={(newDate) => setEndDate(newDate)}
            format="DD/MM/YYYY" // Hiển thị ngày/tháng/năm
          />
          <TimePicker
            disabled={!isEndDateChecked}
            value={endTime}
            onChange={(newTime) => setEndTime(newTime)}
            format="HH:mm" // Định dạng giờ:phút
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
