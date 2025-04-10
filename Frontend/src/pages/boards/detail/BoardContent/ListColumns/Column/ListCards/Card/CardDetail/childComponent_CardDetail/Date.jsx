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
import { useCardSchedule, useDeleteCardDate, useUpdateCardDate } from "../../../../../../../../../../hooks/useCard";
import { useChecklistsItemByDate, useDeleteItemDate, useUpdateItemDate } from "../../../../../../../../../../hooks/useCheckListItem";
import "dayjs/locale/vi"; // Import locale tiếng Việt

dayjs.locale("vi"); // Set locale
const DateModal = ({ open, onClose, onSave, initialData, type, targetId }) => {
  const { cardId } = useParams();
  // console.log("Parent component re-rendered!");
  //  const { data: checklistItemMembers } = useGetMemberInCheckListItem(
  //     type === 'checklist-item' ? targetId : null
  //   );
  const { data: cardSchedule = [] } = useCardSchedule(type === 'card' ? targetId : null); // Chỉ gọi API khi type là "card" và có targetId hợp lệ;
  const { data: checklistSchedule = [] } = useChecklistsItemByDate(type === 'checklist-item' ? targetId : null)// Chỉ gọi API khi type là "checklist-item" và có targetId hợp lệ);
  // console.log(checklistSchedule)
  let schedule = [];
  if (type === "card" && targetId) {
    schedule = cardSchedule;
  } else if (type === "checklist-item" && targetId) {
    schedule = checklistSchedule;
  }
  // console.log(targetId);
  // console.log(schedule)


  // console.log("type",type);
  // console.log(targetId);
  const { mutate: updateCardDate } = useUpdateCardDate();
  const { mutate: updateChecklistItemDate } = useUpdateItemDate();
  const { mutate: deleteDateCard } = useDeleteCardDate();
  const { mutate: deleteDateItem } = useDeleteItemDate();

  // const { mutate: updateChecklistItemDate } = useUpdateItemDate();

  const [startDate, setStartDate] = useState(dayjs().startOf("day"));
  const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  const [endTime, setEndTime] = useState(null);
  const [isStartDateChecked, setIsStartDateChecked] = useState(false);
  const [isEndDateChecked, setIsEndDateChecked] = useState(true);
  const [isEndTimeChecked, setIsEndTimeChecked] = useState(false);
  // const [endDate, setEndDate] = useState(dayjs().startOf("day"));
  // const [endTime, setEndTime] = useState(dayjs().startOf("day"));
  const [reminder, setReminder] = useState(""); // State mặc định rỗn
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
      // console.log("Giá trị mới của state:");
      // console.log("startDate:", startDate);
      // console.log("endDate:", endDate);
      // console.log("endTime:", endTime);
      // console.log("reminder:", reminder);


    }
  }, [schedule]);
  // useEffect(() => {
  //   console.log("Reminder State sau khi cập nhật:", reminder);
  // }, [reminder]);


  // Đảm bảo ngày bắt đầu luôn <= ngày kết thúc
  useEffect(() => {
    if (isStartDateChecked && startDate && endDate) {
      if (startDate.isAfter(endDate)) {
        setEndDate(startDate.add(1, "day"));
      }
    }
  }, [startDate, endDate]);

  // Lưu dữ liệu
  const handleSave = async (e) => {
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


    if (type === "card") {
      // Nếu là card, cập nhật ngày cho card
      updateCardDate({
        targetId,
        startDate: formattedStartDate,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        reminder: formattedReminder,
      });
    } else if (type === "checklist-item") {
      // console.log("đã ấn checklist")
      // Nếu là checklist_item, cập nhật ngày cho checklist_item
      updateChecklistItemDate({
        targetId,
        endDate: formattedEndDate,
        endTime: formattedEndTime,
        reminder: formattedReminder,
      });
    }


    onClose();
  }
  const handleDelete = () => {
    // Gọi API xóa ngày
    if (type === "card") {
      
      // Nếu là card, cập nhật ngày cho card
      deleteDateCard({ targetId }); // Truyền object { targetId }
     
    } else if (type === "checklist-item") {
      // console.log("đã ấn checklist")
      // Nếu là checklist_item, cập nhật ngày cho checklist_item
      deleteDateItem({targetId})
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
                format="DD/MM/YYYY" // Định dạng ngày/tháng/năm
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
        <Button
          onClick={handleDelete} // Hàm xử lý khi nhấn nút Xóa, bạn cần định nghĩa hàm này
          color="error" // Màu đỏ trong Material-UI
          variant="contained"
          size="small"
          sx={{ ml: 5 }} // Thêm khoảng cách giữa hai nút
        >
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DateModal;
