import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Checkbox,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
  IconButton,
  Paper,
  Grid,
} from "@mui/material";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import { useParams } from "react-router-dom";
import { useCardSchedule, useDeleteCardDate, useUpdateCardDate } from "../../../../../../../../../../hooks/useCard";
import { useChecklistsItemByDate, useDeleteItemDate, useUpdateItemDate } from "../../../../../../../../../../hooks/useCheckListItem";
import "dayjs/locale/vi"; // Import locale tiếng Việt

dayjs.locale("vi"); // Set locale

// Hàm tạo lịch
const generateCalendar = (date) => {
  const firstDayOfMonth = dayjs(date).startOf("month");
  const lastDayOfMonth = dayjs(date).endOf("month");
  
  // Ngày đầu tiên trong grid (có thể là ngày tháng trước)
  const startDate = firstDayOfMonth.day(0); // Lấy ngày chủ nhật đầu tiên
  
  // Tạo mảng 6 tuần x 7 ngày
  const calendar = [];
  let currentDate = startDate;
  
  for (let week = 0; week < 6; week++) {
    const weekDays = [];
    for (let day = 0; day < 7; day++) {
      weekDays.push({
        date: currentDate,
        isCurrentMonth: currentDate.month() === date.month(),
      });
      currentDate = currentDate.add(1, "day");
    }
    calendar.push(weekDays);
  }
  
  return calendar;
};

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

  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const [calendar, setCalendar] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(dayjs());
  const [endTime, setEndTime] = useState("15:02");
  const [isStartDateChecked, setIsStartDateChecked] = useState(false);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  const [reminder, setReminder] = useState("Không có");

  // Cập nhật lịch khi tháng thay đổi
  useEffect(() => {
    setCalendar(generateCalendar(currentMonth));
  }, [currentMonth]);

  // Load dữ liệu cũ khi mở modal
  useEffect(() => {
    if (schedule) {
      setIsStartDateChecked(!!schedule.start_date);
      setStartDate(schedule.start_date ? dayjs(schedule.start_date) : null);

      setIsEndDateChecked(!!schedule.end_date);
      if (schedule.end_date) {
        const endDateObj = dayjs(schedule.end_date);
        setEndDate(endDateObj);
        setCurrentMonth(endDateObj);
      } else {
        setEndDate(dayjs());
        setCurrentMonth(dayjs());
      }

      if (schedule.end_time) {
        const timeWithoutSeconds = schedule.end_time.split(':').slice(0, 2).join(':');
        setEndTime(timeWithoutSeconds);
      } else {
        setEndTime("15:02");
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
  }, [startDate, endDate, isStartDateChecked]);

  // Xử lý thay đổi tháng
  const handlePrevMonth = () => {
    setCurrentMonth(currentMonth.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentMonth(currentMonth.add(1, "month"));
  };

  const handlePrevYear = () => {
    setCurrentMonth(currentMonth.subtract(1, "year"));
  };

  const handleNextYear = () => {
    setCurrentMonth(currentMonth.add(1, "year"));
  };

  // Xử lý chọn ngày
  const handleDateClick = (date) => {
    if (isEndDateChecked) {
      setEndDate(date);
    } else if (isStartDateChecked) {
      setStartDate(date);
    }
  };

  // Xử lý thay đổi thời gian
  const handleTimeChange = (e) => {
    let value = e.target.value;
    const timeRegex = /^(?:(?:[0-1]?[0-9]?|2[0-3]?)?(?:$|:(?:[0-5]?[0-9]?)?$))/;
    if (value === "" || timeRegex.test(value)) {
      setEndTime(value);
    }
  };

  // Xử lý khi người dùng rời khỏi ô nhập thời gian (onBlur)
  const handleTimeBlur = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (!timeRegex.test(endTime)) {
      setEndTime("15:02");
    }
  };

  // Lưu dữ liệu
  const handleSave = async (e) => {
    e.preventDefault();

    if (!isEndDateChecked || !endDate) {
      return;
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    let formattedEndTime = endTime;
    if (!timeRegex.test(endTime)) {
      formattedEndTime = "15:02";
    }

    const formattedEndDateTime = `${endDate.format("YYYY-MM-DD")} ${formattedEndTime}`;
    const endDateTime = dayjs(formattedEndDateTime, "YYYY-MM-DD HH:mm");

    if (!endDateTime.isValid()) {
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

  // Format tên tháng hiển thị
  const formatMonthYear = (date) => {
    const monthNames = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", 
                         "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
    return `${monthNames[date.month()]} ${date.year()}`;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          width: "350px",
          borderRadius: "8px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.15)",
          overflow: "visible",
        },
      }}
    >
      <DialogTitle
        sx={{
          fontWeight: "600",
          fontSize: "16px",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#172B4D",
          borderBottom: "1px solid #EBECF0",
        }}
      >
        <span>Ngày</span>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#6B778C",
            "&:hover": {
              backgroundColor: "#EBECF0",
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: "0 16px" }}>
        {/* Header lịch */}
        <Box sx={{ mt: 1, mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconButton size="small" onClick={handlePrevYear}>
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handlePrevMonth}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Typography sx={{ fontWeight: "500", fontSize: "14px" }}>
            {formatMonthYear(currentMonth)}
          </Typography>
          <IconButton size="small" onClick={handleNextMonth}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={handleNextYear}>
            <KeyboardDoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </Box>
        
        {/* Lịch */}
        <Box>
          {/* Header ngày trong tuần */}
          <Grid container spacing={0} sx={{ textAlign: "center", mb: 1 }}>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th2</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th3</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th4</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th5</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th6</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>Th7</Grid>
            <Grid item xs={12/7} sx={{ fontSize: "12px", fontWeight: "bold", color: "#5E6C84" }}>CN</Grid>
          </Grid>
          
          {/* Ngày trong tháng */}
          {calendar.map((week, weekIndex) => (
            <Grid container spacing={0} key={`week-${weekIndex}`} sx={{ textAlign: "center", mb: 0.5 }}>
              {week.map((day, dayIndex) => {
                const isSelectedStart = isStartDateChecked && 
                  startDate && 
                  day.date.format("YYYY-MM-DD") === startDate.format("YYYY-MM-DD");
                
                const isSelectedEnd = isEndDateChecked && 
                  endDate && 
                  day.date.format("YYYY-MM-DD") === endDate.format("YYYY-MM-DD");
                
                const isToday = day.date.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD");

                return (
                  <Grid 
                    item 
                    xs={12/7} 
                    key={`day-${dayIndex}`}
                    onClick={() => handleDateClick(day.date)}
                    sx={{
                      fontSize: "14px",
                      padding: "5px 0",
                      cursor: "pointer",
                      color: !day.isCurrentMonth ? "#C1C7D0" : 
                             isToday ? "#0079BF" : "#172B4D",
                      fontWeight: isToday ? "bold" : "normal",
                      backgroundColor: isSelectedEnd ? "#0079BF" : 
                                       isSelectedStart ? "#E4F0F6" : "transparent",
                      color: isSelectedEnd ? "white" : 
                             !day.isCurrentMonth ? "#C1C7D0" : 
                             isToday ? "#0079BF" : "#172B4D",
                      borderRadius: "3px",
                      "&:hover": {
                        backgroundColor: isSelectedEnd ? "#0079BF" : 
                                        isSelectedStart ? "#E4F0F6" : "#F4F5F7",
                      }
                    }}
                  >
                    {day.date.date()}
                  </Grid>
                );
              })}
            </Grid>
          ))}
        </Box>

        {/* Ngày bắt đầu */}
        {type !== "checklist-item" && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography sx={{ fontSize: "14px", mb: 0.5 }}>Ngày bắt đầu</Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Checkbox
                size="small"
                checked={isStartDateChecked}
                onChange={(e) => {
                  setIsStartDateChecked(e.target.checked);
                  setStartDate(e.target.checked ? dayjs() : null);
                }}
                sx={{
                  color: "#0079BF",
                  padding: "2px",
                  '&.Mui-checked': {
                    color: "#0079BF",
                  }
                }}
              />
              <TextField
                value={isStartDateChecked && startDate ? startDate.format("DD/MM/YYYY") : "N/T/NNNN"}
                disabled={!isStartDateChecked}
                variant="outlined"
                size="small"
                sx={{
                  width: "100%",
                  '& .MuiOutlinedInput-root': {
                    fontSize: '14px',
                    height: '32px',
                  }
                }}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Box>
          </Box>
        )}

        {/* Ngày hết hạn */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography sx={{ fontSize: "14px", mb: 0.5 }}>Ngày hết hạn</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Checkbox
              size="small"
              checked={isEndDateChecked}
              onChange={(e) => setIsEndDateChecked(e.target.checked)}
              sx={{
                color: "#0079BF",
                padding: "2px",
                '&.Mui-checked': {
                  color: "#0079BF",
                }
              }}
            />
            <TextField
              value={isEndDateChecked && endDate ? endDate.format("DD/MM/YYYY") : ""}
              disabled={!isEndDateChecked}
              variant="outlined"
              size="small"
              sx={{
                width: "150px",
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  height: '32px',
                }
              }}
              InputProps={{
                readOnly: true,
              }}
            />
            <TextField
              type="text"
              value={endTime}
              onChange={handleTimeChange}
              onBlur={handleTimeBlur}
              placeholder="HH:mm"
              disabled={!isEndDateChecked}
              variant="outlined"
              size="small"
              sx={{
                width: "80px",
                '& .MuiOutlinedInput-root': {
                  fontSize: '14px',
                  height: '32px',
                }
              }}
            />
          </Box>
        </Box>

        {/* Nhắc nhở */}
        <Box sx={{ mt: 2, mb: 2 }}>
          <Typography sx={{ fontSize: "14px", mb: 0.5 }}>Thiết lập Nhắc nhở</Typography>
          <FormControl 
            fullWidth 
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '3px',
                height: '36px',
              }
            }}
          >
            <Select
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              sx={{ 
                fontSize: '14px',
              }}
              size="small"
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
          <Typography sx={{ fontSize: "12px", color: "#6B778C", mt: 1 }}>
            Nhắc nhở sẽ được gửi đến tất cả các thành viên và người theo dõi thẻ này.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions 
        sx={{ 
          display: "flex", 
          justifyContent: "space-between", 
          padding: "8px 16px 16px 16px",
        }}
      >
        <Button
          onClick={handleSave}
          variant="contained"
          fullWidth
          sx={{ 
            backgroundColor: "#0079BF", 
            textTransform: 'none',
            borderRadius: '3px',
            boxShadow: 'none',
            height: '36px',
            mb: 1,
            '&:hover': {
              backgroundColor: '#026AA7',
              boxShadow: 'none'
            }
          }}
        >
          Lưu
        </Button>
      </DialogActions>
      
      <Box sx={{ pb: 2, px: 2 }}>
        <Button
          onClick={onClose}
          variant="text"
          fullWidth
          sx={{ 
            color: "#172B4D", 
            textTransform: 'none',
            borderRadius: '3px',
            height: '36px',
            '&:hover': {
              backgroundColor: '#F4F5F7',
            }
          }}
        >
          Gỡ bỏ
        </Button>
      </Box>
    </Dialog>
  );
};

export default DateModal;