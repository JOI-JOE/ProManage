import React, { useState, useEffect, useMemo } from "react";
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
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import { useParams } from "react-router-dom";
import { useCardSchedule, useDeleteCardDate, useUpdateCardDate } from "../../../../../../../../../../hooks/useCard";
import { useChecklistsItemByDate, useDeleteItemDate, useUpdateItemDate } from "../../../../../../../../../../hooks/useCheckListItem";
import "dayjs/locale/vi"; // Import locale tiếng Việt

dayjs.locale("vi"); // Set locale

const DateModal = ({ open, onClose, onSave, initialData, type, targetId }) => {
  const { cardId } = useParams();
  const { data: cardSchedule = [] } = useCardSchedule(type === 'card' ? targetId : null);
  const { data: checklistSchedule = [] } = useChecklistsItemByDate(type === 'checklist-item' ? targetId : null);

  const schedule = useMemo(() => {
    if (type === "card") return cardSchedule;
    if (type === "checklist-item") return checklistSchedule;
    return null;
  }, [cardSchedule, checklistSchedule, type]);
  const { mutate: updateCardDate } = useUpdateCardDate();
  const { mutate: updateChecklistItemDate } = useUpdateItemDate();
  const { mutate: deleteDateCard } = useDeleteCardDate();
  const { mutate: deleteDateItem } = useDeleteItemDate();

  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [endTime, setEndTime] = useState("12:00"); // Mặc định là chuỗi "12:00"
  const [isStartDateChecked, setIsStartDateChecked] = useState(false);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  const [isEndTimeChecked, setIsEndTimeChecked] = useState(false);
  const [reminder, setReminder] = useState("Không có");

  // Load dữ liệu cũ khi mở modal
  useEffect(() => {
    if (schedule) {
      setIsStartDateChecked(!!schedule.start_date);
      setStartDate(schedule.start_date ? dayjs(schedule.start_date) : dayjs().startOf("day"));

      setIsEndDateChecked(!!schedule.end_date);
      setEndDate(schedule.end_date ? dayjs(schedule.end_date) : dayjs().startOf("day"));

      setIsEndTimeChecked(!!schedule.end_time);
      if (schedule.end_time) {
        const timeWithoutSeconds = schedule.end_time.split(':').slice(0, 2).join(':'); // Lấy "HH:mm" từ "HH:mm:ss"
        setEndTime(timeWithoutSeconds);
      } else {
        setEndTime("12:00");
      }

      // Nếu có reminder, tính khoảng thời gian so với `endDateTime`
      if (schedule.reminder && schedule.end_date && schedule.end_time) {
        const endDateTime = dayjs(`${schedule.end_date} ${schedule.end_time}`, "YYYY-MM-DD HH:mm:ss");
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

  // Xử lý thay đổi thời gian
  const handleTimeChange = (e) => {
    let value = e.target.value;

    // Cho phép nhập từng ký tự, chỉ cần khớp với các định dạng trung gian
    const timeRegex = /^(?:(?:[0-1]?[0-9]?|2[0-3]?)?(?:$|:(?:[0-5]?[0-9]?)?$))/;
    if (value === "" || timeRegex.test(value)) {
      setEndTime(value);
    }
  };

  // Xử lý khi người dùng rời khỏi ô nhập thời gian (onBlur)
  const handleTimeBlur = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(endTime)) {
      setEndTime("12:00"); // Đặt lại giá trị mặc định nếu không hợp lệ
    }
  };

  // Lưu dữ liệu
  const handleSave = async (e) => {
    e.preventDefault();

    if (!isEndDateChecked || !endDate) {
      return; // Không hiển thị thông báo, chỉ thoát
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    let formattedEndTime = endTime;
    if (!timeRegex.test(endTime)) {
      formattedEndTime = "12:00"; // Sử dụng giá trị mặc định nếu thời gian không hợp lệ
    }

    const formattedEndDateTime = `${endDate.format("YYYY-MM-DD")} ${formattedEndTime}`;
    const endDateTime = dayjs(formattedEndDateTime, "YYYY-MM-DD HH:mm");

    if (!endDateTime.isValid()) {
      return; // Không hiển thị thông báo, chỉ thoát
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
    const formattedReminder = reminderDateTime ? reminderDateTime.format("YYYY-MM-DD HH:mm") : null;

    if (type === "card") {
      updateCardDate({
        targetId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        reminder: formattedReminder,
      });
    } else if (type === "checklist-item") {
      updateChecklistItemDate({
        targetId,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        reminder: formattedReminder,
      });
    }

    onClose();
  };

  // Xóa ngày
  const handleDelete = () => {
    if (type === "card") {
      deleteDateCard({ targetId });
    } else if (type === "checklist-item") {
      deleteDateItem({ targetId });
    }
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
      {type !== "checklist-item" && (
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
                format="DD/MM/YYYY"
              />
            </LocalizationProvider>
          </Box>
        </Box>
      )}

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
              format="DD/MM/YYYY"
            />
            <TextField
            
              type="text"
              value={endTime}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
              placeholder="HH:mm"
              sx={{ width: "90px" }}
              disabled={!isEndDateChecked}
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
            <MenuItem value="Vào thời điểm ngày hết hạn">Vào thời điểm ngày hết hạn</MenuItem>
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
          Nhắc nhở sẽ được gửi đến tất cả các thành viên và người theo dõi thẻ này.
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
        <Button
          onClick={handleDelete}
          color="error"
          variant="contained"
          size="small"
          sx={{ ml: 5 }}
        >
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateModal;