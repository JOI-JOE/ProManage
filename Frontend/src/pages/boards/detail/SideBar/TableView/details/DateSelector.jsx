import {
    Box,
    IconButton,
    Menu,
    TextField,
    Typography,
    MenuItem,
    Button,
    Tooltip,
} from "@mui/material";
import { AccessTime } from "@mui/icons-material";
import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const reminderOptions = [
    { label: "Không có", value: null },
    { label: "Vào thời điểm ngày hết hạn", value: 0 },
    { label: "5 Phút trước", value: 5 },
    { label: "10 Phút trước", value: 10 },
    { label: "15 Phút trước", value: 15 },
    { label: "1 Giờ trước", value: 60 },
    { label: "2 Giờ trước", value: 120 },
    { label: "1 Ngày trước", value: 1440 },
    { label: "2 Ngày trước", value: 2880 },
];

const DateSelector = ({ cardId, end_date, end_time, reminder,is_completed, onUpdateDate }) => {
    // console.log(end_date);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const [date, setDate] = useState(null);
    const [time, setTime] = useState(null);

    
    const endDateTime = dayjs(`${end_date} ${end_time}`);
    const reminderTime = reminder ? dayjs(reminder) : null;
    const diffInMinutes = reminderTime ? endDateTime.diff(reminderTime, "minute") : null;

    const matchedOption = reminderOptions.find((opt) => opt.value === diffInMinutes);
    const defaultReminder = matchedOption?.label || "15 Phút trước";

    const [selectedReminder, setSelectedReminder] = useState(defaultReminder);
        
    useEffect(() => {
        setDate(end_date ?? null);
        setTime(end_time ?? null);
    }, [end_date, end_time]);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleSave = () => {
        const endDateTime = dayjs(`${date} ${time}`);
        const formattedTime = time && time.length === 5 ? `${time}:00` : time;
        const reminderMinutes =
            reminderOptions.find((opt) => opt.label === selectedReminder)?.value;

        const reminderDateTime =
            reminderMinutes == null
                ? null
                : endDateTime.subtract(reminderMinutes, "minute").format("YYYY-MM-DD HH:mm:ss");
                console.log(cardId,
                    date,
                    time,
                    reminderDateTime);
                    

        onUpdateDate({
            card_id: cardId,
            end_date: date,
            end_time: formattedTime,
            reminder: reminderDateTime,
        });

        handleClose();
    };

    // Logic xác định trạng thái màu
    // Logic xác định trạng thái màu
    const getDateStatus = () => {
        if (!end_date || !end_time) return { color: "#e0e0e0", backgroundColor: "#f5f5f5" }; // Màu mặc định nếu không có ngày

        const now = dayjs();
        const end = dayjs(`${end_date} ${end_time}`);
        const diffInHours = end.diff(now, "hour");

        if (is_completed) {
            // Nếu thẻ đã hoàn thành, hiển thị màu xanh bất kể quá hạn hay sắp đến hạn
            return { color: "#2e7d32", backgroundColor: "#e8f5e9" };
        }

        if (end.isBefore(now)) {
            // Quá hạn và chưa hoàn thành: Màu đỏ
            return { color: "#c62828", backgroundColor: "#fdecea" };
        } else if (diffInHours <= 24) {
            // Sắp đến hạn (trong 24 giờ) và chưa hoàn thành: Màu vàng
            return { color: "#f57f17", backgroundColor: "#fff8e1" };
        } else {
            // Còn thời gian (hơn 24 giờ): Màu xanh
            return { color: "#2e7d32", backgroundColor: "#e8f5e9" };
        }
    };

    const dateStatus = getDateStatus();
    const formattedDate = end_date ? dayjs(`${end_date}`).format("D [thg] M ") : "";

    return (
        <Box>
            {end_date ? (
                <Tooltip
                    title={dayjs(`${end_date} ${end_time}`).format(
                        "dddd, D MMMM YYYY, HH:mm"
                    )}
                >
                    <Box
                        onClick={handleClick}
                        sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 1,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            border: "1px solid #ccc",
                            bgcolor: dateStatus.backgroundColor,
                            color: dateStatus.color,
                            fontWeight: 500,
                            cursor: "pointer",
                        }}
                    >
                        <AccessTime sx={{ fontSize: 18 }} />
                        <span>{formattedDate}</span>
                       

                    </Box>
                </Tooltip>
            ) : (
                <IconButton onClick={handleClick}>
                    <AccessTime />
                </IconButton>
            )}

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                <Box sx={{ px: 2, py: 1, width: 340 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Chọn ngày hết hạn
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                        <TextField
                            type="date"
                            value={date  || ""}
                            size="small"
                            onChange={(e) => setDate(e.target.value)}
                            fullWidth
                        />
                        <TextField
                            type="time"
                            value={time  || ""}
                            size="small"
                            onChange={(e) => setTime(e.target.value)}
                            fullWidth
                        />
                    </Box>

                    <TextField
                        select
                        label="Nhắc trước"
                        value={selectedReminder}
                        onChange={(e) => setSelectedReminder(e.target.value)}
                        fullWidth
                        size="small"
                        sx={{ mb: 2 }}
                    >
                        {reminderOptions.map((option) => (
                            <MenuItem key={option.label} value={option.label}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Button variant="contained" onClick={handleSave}>
                            Lưu
                        </Button>
                        <Button
                            variant="text"
                            color="error"
                            onClick={() =>
                                onUpdateDate({
                                    card_id: cardId,
                                    end_date: null,
                                    end_time: null,
                                    reminder: null,
                                })
                            }
                        >
                            Xoá
                        </Button>
                    </Box>
                </Box>
            </Menu>
        </Box>
    );
};

export default DateSelector;
