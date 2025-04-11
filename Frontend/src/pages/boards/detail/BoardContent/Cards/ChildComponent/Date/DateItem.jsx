import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Checkbox,
    Typography,
    FormControlLabel,
    IconButton,
    Select,
    MenuItem,
    FormControl,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { PickersDay } from "@mui/x-date-pickers/PickersDay";
import dayjs from "dayjs";
import CloseIcon from "@mui/icons-material/Close";
import "dayjs/locale/vi";

dayjs.locale("vi");

const REMINDER_OPTIONS = [
    "Không có",
    "5 phút trước",
    "10 phút trước",
    "15 phút trước",
    "1 giờ trước",
    "2 giờ trước",
    "1 ngày trước",
    "2 ngày trước",
];

const roundToNearest5Minutes = (time) => {
    const minutes = time.minute();
    const roundedMinutes = Math.round(minutes / 5) * 5;
    return time.set("minute", roundedMinutes).set("second", 0);
};

const DateItem = ({ open, onClose, type, item, onSave }) => { // Thêm onSave vào props
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [endTime, setEndTime] = useState(null);
    const [isStartDateChecked, setIsStartDateChecked] = useState(false);
    const [isEndDateChecked, setIsEndDateChecked] = useState(true);
    const [reminder, setReminder] = useState("Không có");
    const [selectionMode, setSelectionMode] = useState("end");

    useEffect(() => {
        if (!item) {
            const now = dayjs();
            setEndDate(now);
            const defaultTime = roundToNearest5Minutes(now.add(30, "minute"));
            setEndTime(defaultTime);
            return;
        }

        const newEndDate = item.end_date ? dayjs(item.end_date).startOf("day") : dayjs();
        setEndDate(newEndDate);

        let defaultTime;
        if (item.end_time) {
            const [hours, minutes] = item.end_time.split(":");
            defaultTime = dayjs().set("hour", parseInt(hours)).set("minute", parseInt(minutes));
        } else {
            const now = dayjs();
            defaultTime = now.add(30, "minute");
        }
        const roundedTime = roundToNearest5Minutes(defaultTime);
        setEndTime(roundedTime);

        if (item.reminder && item.end_date && item.end_time) {
            const endDateTime = dayjs(item.end_date).set("hour", defaultTime.hour()).set("minute", defaultTime.minute());
            const reminderDateTime = dayjs(item.reminder);
            const diff = endDateTime.diff(reminderDateTime, "minute");

            const foundLabel = REMINDER_OPTIONS.find((option) => {
                const minutes = {
                    "Không có": null,
                    "5 phút trước": 5,
                    "10 phút trước": 10,
                    "15 phút trước": 15,
                    "1 giờ trước": 60,
                    "2 giờ trước": 120,
                    "1 ngày trước": 1440,
                    "2 ngày trước": 2880,
                }[option];
                return minutes === diff;
            });

            setReminder(foundLabel || "Không có");
        } else {
            setReminder("Không có");
        }

        if (type === "card") {
            const newStartDate = item.start_date ? dayjs(item.start_date) : null;
            setStartDate(newStartDate);
            setIsStartDateChecked(!!item.start_date);
        }
    }, [item, type]);

    const handleDateChange = (newValue) => {
        if (type === "checklist-item") {
            setEndDate(newValue);
        } else if (type === "card") {
            if (selectionMode === "start") {
                if (isEndDateChecked && endDate && newValue.isAfter(endDate)) {
                    setEndDate(newValue.add(1, "day"));
                }
                setStartDate(newValue);
                if (isStartDateChecked && isEndDateChecked) {
                    setSelectionMode("end");
                }
            } else {
                if (isStartDateChecked && startDate && newValue.isBefore(startDate)) {
                    setStartDate(newValue.subtract(1, "day"));
                }
                setEndDate(newValue);
                if (isStartDateChecked && isEndDateChecked) {
                    setSelectionMode("start");
                }
            }
        }
    };

    const handleTimeChange = (newTime) => {
        const roundedTime = roundToNearest5Minutes(newTime);
        setEndTime(roundedTime);
    };

    const handleSave = (e) => {
        e.preventDefault();

        if (isEndDateChecked && (!endDate || !endTime)) {
            console.error("Ngày kết thúc hoặc thời gian chưa được chọn!");
            return;
        }

        if (type === "card" && isStartDateChecked && startDate && endDate && startDate.isAfter(endDate)) {
            console.error("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
            return;
        }

        const payload = {};

        if (isEndDateChecked && endDate && endTime) {
            const endDateTime = dayjs(`${endDate.format("YYYY-MM-DD")} ${endTime.format("HH:mm")}`);
            if (!endDateTime.isValid()) return;

            const reminderMinutes = {
                "Không có": null,
                "5 phút trước": 5,
                "10 phút trước": 10,
                "15 phút trước": 15,
                "1 giờ trước": 60,
                "2 giờ trước": 120,
                "1 ngày trước": 1440,
                "2 ngày trước": 2880,
            }[reminder];

            const reminderDateTime =
                reminderMinutes !== null ? endDateTime.subtract(reminderMinutes, "minute") : null;

            payload.endDate = endDate.format("YYYY-MM-DD");
            payload.endTime = endTime.format("HH:mm");
            payload.reminder = reminderDateTime ? reminderDateTime.format("YYYY-MM-DD HH:mm") : null;
        } else {
            payload.endDate = null;
            payload.endTime = null;
            payload.reminder = null;
        }

        if (type === "card") {
            payload.startDate = isStartDateChecked && startDate ? startDate.format("YYYY-MM-DD") : null;
        }

        // Gọi onSave với dữ liệu payload trước khi đóng dialog
        onSave(payload);
        onClose();
    };

    const renderDay = (day, selectedDays, pickersDayProps) => {
        const isInRange =
            type === "card" &&
            isStartDateChecked &&
            isEndDateChecked &&
            startDate &&
            endDate &&
            day.isAfter(startDate, "day") &&
            day.isBefore(endDate, "day");

        const isStartDay =
            type === "card" &&
            isStartDateChecked &&
            startDate &&
            day.isSame(startDate, "day");

        const isEndDay =
            type === "card" &&
            isEndDateChecked &&
            endDate &&
            day.isSame(endDate, "day");

        return (
            <PickersDay
                {...pickersDayProps}
                sx={{
                    ...(isInRange && {
                        backgroundColor: "#e3f2fd",
                        borderRadius: 0,
                        "&:hover": { backgroundColor: "#bbdefb" },
                    }),
                    ...(isStartDay && {
                        backgroundColor: "#00C4B4",
                        color: "white",
                        borderRadius: "50%",
                        "&:hover": { backgroundColor: "#00b3a3" },
                    }),
                    ...(isEndDay && {
                        backgroundColor: "#00C4B4",
                        color: "white",
                        borderRadius: "50%",
                        "&:hover": { backgroundColor: "#00b3a3" },
                    }),
                }}
            />
        );
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            sx={{ "& .MuiDialog-paper": { width: "600px", borderRadius: 2, boxShadow: "0 8px 16px rgba(0,0,0,0.1)" } }}
        >
            <DialogTitle
                sx={{
                    fontWeight: "bold",
                    borderBottom: "1px solid #eee",
                    py: 1.5,
                    px: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    bgcolor: "#f5f5f5",
                }}
            >
                Ngày
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 2, display: "flex", alignItems: "center", bgcolor: "#fafafa" }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                    <StaticDatePicker
                        value={type === "checklist-item" || selectionMode === "end" ? endDate : startDate}
                        onChange={handleDateChange}
                        dayOfWeekFormatter={(day) => ["CN", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7"][dayjs(day).day()]}
                        renderDay={renderDay}
                        sx={{
                            mr: 2,
                            bgcolor: "white",
                            borderRadius: 2,
                            "& .MuiPickersDay-root": {
                                "&:hover": { backgroundColor: "#e3f2fd" },
                                "&.MuiPickersDay-today": {
                                    border: "1px solid #1976d2",
                                    borderRadius: "50%",
                                    backgroundColor: "white",
                                    color: "black",
                                },
                            },
                            "& .MuiPickersCalendarHeader-root": {
                                bgcolor: "#1976d2",
                                color: "white",
                                borderRadius: "8px 8px 0 0",
                            },
                            "& .MuiDayPicker-weekDayLabel": {
                                fontWeight: 500,
                                color: "#1976d2",
                            },
                        }}
                        slotProps={{ actionBar: { actions: ["today"] } }}
                    />
                </LocalizationProvider>

                <Box sx={{ flex: 1 }}>
                    {type === "card" && (
                        <Box sx={{ mb: 2, p: 2, bgcolor: "white", borderRadius: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        size="small"
                                        checked={isStartDateChecked}
                                        onChange={(e) => {
                                            setIsStartDateChecked(e.target.checked);
                                            if (e.target.checked) {
                                                if (!startDate) setStartDate(dayjs());
                                                setSelectionMode("start");
                                            } else {
                                                setSelectionMode("end");
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        Ngày bắt đầu: <br />
                                        <Typography component="span" sx={{ fontSize: "1rem", fontWeight: 500, color: "#1976d2" }}>
                                            {isStartDateChecked && startDate ? startDate.format("DD/MM/YYYY") : "N/T/NNNN"}
                                        </Typography>
                                    </Typography>
                                }
                            />
                        </Box>
                    )}

                    <Box sx={{ mb: 2, p: 2, bgcolor: "white", borderRadius: 2 }}>
                        <FormControlLabel
                            sx={{ mb: "10px" }}
                            control={
                                <Checkbox
                                    size="small"
                                    checked={isEndDateChecked}
                                    onChange={(e) => {
                                        setIsEndDateChecked(e.target.checked);
                                        if (e.target.checked) {
                                            if (!endDate) setEndDate(dayjs());
                                            if (!endTime) {
                                                const now = dayjs();
                                                const defaultTime = roundToNearest5Minutes(now.add(30, "minute"));
                                                setEndTime(defaultTime);
                                            }
                                            setSelectionMode("end");
                                        } else {
                                            setEndDate(null);
                                            setEndTime(null);
                                            setReminder("Không có");
                                            if (type === "card" && isStartDateChecked) setSelectionMode("start");
                                        }
                                    }}
                                />
                            }
                            label={
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    Ngày hết hạn:<br />
                                    <Typography component="span" sx={{ fontSize: "1rem", fontWeight: 500, color: "#1976d2" }}>
                                        {isEndDateChecked && endDate ? endDate.format("DD/MM/YYYY") : "N/T/NNNN"}
                                        {isEndDateChecked && endTime ? ` ${endTime.format("HH:mm")}` : ""}
                                    </Typography>
                                </Typography>
                            }
                        />
                        {isEndDateChecked && (
                            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
                                <TimePicker
                                    value={endTime}
                                    onChange={handleTimeChange}
                                    format="HH:mm"
                                    sx={{ mt: 1, width: "120px" }}
                                    minutesStep={5}
                                    slotProps={{
                                        textField: {
                                            sx: {
                                                bgcolor: "#fff",
                                                borderRadius: 1,
                                                "& .MuiInputBase-input": {
                                                    fontSize: "1rem",
                                                    fontWeight: 500,
                                                    color: "#1976d2",
                                                    textAlign: "center",
                                                },
                                            },
                                            readOnly: true,
                                        },
                                        popper: {
                                            sx: {
                                                "& .MuiMultiSectionDigitalClockSection-root": {
                                                    maxHeight: "200px",
                                                    overflowY: "auto",
                                                    width: "70px",
                                                    scrollbarWidth: "thin",
                                                    scrollbarColor: "#1976d2 transparent",
                                                    "&::-webkit-scrollbar": { width: "4px" },
                                                    "&::-webkit-scrollbar-thumb": { backgroundColor: "#1976d2", borderRadius: "4px" },
                                                    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
                                                },
                                                "& .MuiMultiSectionDigitalClockSection-item": {
                                                    borderRadius: "6px",
                                                    fontSize: "1rem",
                                                    padding: "6px 0",
                                                    textAlign: "center",
                                                    transition: "background-color 0.2s",
                                                    "&:hover": { backgroundColor: "#e3f2fd", color: "#1976d2" },
                                                    "&.Mui-selected": { backgroundColor: "#1976d2", color: "white", "&:hover": { backgroundColor: "#1565c0" } },
                                                },
                                            },
                                        },
                                        actionBar: { actions: ["accept"] },
                                    }}
                                />
                            </LocalizationProvider>
                        )}
                    </Box>

                    <Box sx={{ mb: 1, p: 2, bgcolor: "white", borderRadius: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
                            Thiết lập Nhắc nhở
                        </Typography>
                        <FormControl fullWidth size="small">
                            <Select
                                value={reminder}
                                onChange={(e) => setReminder(e.target.value)}
                                sx={{ height: 32, bgcolor: "#fff" }}
                                disabled={!isEndDateChecked}
                            >
                                {REMINDER_OPTIONS.map((option) => (
                                    <MenuItem key={option} value={option}>{option}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: "1px solid #eee", bgcolor: "#f5f5f5" }}>
                <Button variant="contained" onClick={handleSave} sx={{ minWidth: 80 }}>
                    Lưu
                </Button>
                <Button variant="outlined" onClick={onClose} sx={{ minWidth: 80, ml: 1 }}>
                    Hủy bỏ
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default DateItem;