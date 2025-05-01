import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  IconButton,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Button,
  Typography,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import dayjs from "dayjs";
import axios from "axios";
import { useCreateCard } from "../../../../../hooks/useCard";
import { useQueryClient } from "@tanstack/react-query";

const AddCardModal = ({ open, onClose, workspace, boardIds }) => {
  const queryClient = useQueryClient();

  // const { workspaceIds } = useMe();
  const boards = workspace?.boards || [];
  console.log(workspace);

  const [title, setTitle] = useState("");
  const [listId, setListId] = useState("");
  // const [listId, setListId] = useState("");
  const availableLists = workspace?.boards.flatMap((board) => board.lists);

  useEffect(() => {
    // Tìm list đầu tiên (nếu có) để đặt làm mặc định
    const firstList = boards
      .flatMap((board) => board.lists)
      .find((list) => list);
    if (firstList && !listId) {
      setListId(firstList.id);
    }
  }, [boards, listId]);
 

  const [startEnabled, setStartEnabled] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [dueEnabled, setDueEnabled] = useState(false);

  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const { mutate, isLoading, isError, error } = useCreateCard();

  const handleAddCard = async () => {
    if (!title || !listId) return;

    // Định dạng ngày nếu có
    const formattedStartDate = startEnabled && startDate ? dayjs(startDate).format("YYYY-MM-DD") : null;
    const formattedEndDate =
      dueEnabled && endDate
        ? endTime
          ? `${dayjs(endDate).format("YYYY-MM-DD")} ${endTime}`
          : dayjs(endDate).format("YYYY-MM-DD")
        : null;

        const formattedEndTime = dueEnabled && endTime ? endTime : null;


    // Tính position (giả sử lấy số lớn nhất hiện tại + 1)
    const position = 16384; // Giá trị mặc định, có thể thay đổi

    // Dữ liệu gửi đi (khớp với API)
    const data = {
      title: title,
      columnId: listId,
      // position: position,
      start_date: formattedStartDate,
      end_date: formattedEndDate,
      end_time: formattedEndTime,
    };

    console.log(data);

    try {
      await mutate(data, {
        onSuccess: () => {
          // console.log("✅ Thẻ được tạo thành công!");
          queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
          // Reset form hoặc thực hiện các hành động khác nếu cần
          setTitle("");
          // setListId("");
          setStartEnabled(false);
          setStartDate("");
          setDueEnabled(false);
          setEndDate("");
          setEndTime("");
          onClose();
        },
      });
    } catch (err) {
      console.error("❌ Lỗi khi gọi mutation:", err);
    }

    
  };

  const handleClose = () => {
    // Reset tất cả các state về mặc định
    setTitle("");
    // setListId("");
    setStartEnabled(false);
    setStartDate("");
    setDueEnabled(false);
    setEndDate("");
    setEndTime("");

    // Gọi hàm onClose bên ngoài (nếu cần đóng modal từ parent)
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontWeight: "600", fontSize: "18px", textAlign: "center" }}>
        Thêm thẻ
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 12, right: 12 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ px: 3, pb: 3, pt: 1 }}>
        {/* Tên */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            Tên
          </Typography>
          <TextField
            fullWidth
            placeholder="Nhập tên cho thẻ này"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            size="small"
          />
        </Box>

        {/* Danh sách */}
        <Box sx={{ mb: 2 }}>
          <Typography fontWeight={600} fontSize={14} mb={0.5}>
            Danh sách
          </Typography>
          <TextField
            select
            fullWidth
            value={listId}
            onChange={(e) => setListId(e.target.value)}
            size="small"
            disabled={boards.every((board) => board.lists.length === 0)} // Vô hiệu hóa nếu không có list nào
          >
            {boards.length > 0 ? (
              boards.map((board) => [
                // Hiển thị tên board (vô hiệu hóa để không chọn được)
                <MenuItem
                  key={`board-${board.id}`}
                  value=""
                  disabled
                  sx={{
                    fontWeight: "bold",
                    color: "text.primary",
                    bgcolor: "grey.100",
                  }}
                >
                  {board.name}
                </MenuItem>,
                // Hiển thị các list thuộc board
                board.lists.length > 0 ? (
                  board.lists.map((list) => (
                    <MenuItem
                      key={list.id}
                      value={list.id}
                      sx={{ pl: 4 }} // Thụt lề để phân biệt với board
                    >
                      {list.name}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem
                    key={`no-list-${board.id}`}
                    value=""
                    disabled
                    sx={{ pl: 4, color: "text.secondary" }}
                  >
                    Không có danh sách
                  </MenuItem>
                ),
              ])
            ) : (
              <MenuItem value="" disabled>
                Không có bảng nào
              </MenuItem>
            )}
          </TextField>
        </Box>

        {/* Ngày bắt đầu & Ngày hết hạn */}
        <Box sx={{ mb: 3 }}>
          {/* Ngày bắt đầu */}
          <Box sx={{ mb: 2 }}>
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Ngày bắt đầu
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                size="small"
                checked={startEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setStartEnabled(checked);
                  if (checked) {
                    setStartDate(dayjs().format("YYYY-MM-DD")); // format chuẩn cho input type="date"
                  }
                }}
                sx={{ p: 0.5 }}
              />
              <TextField
                type="date"
                size="small"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!startEnabled}
                sx={{ width: 160 }}
                InputProps={{
                  sx: { height: 36, borderRadius: 1 },
                }}
              />
            </Box>
          </Box>

          {/* Ngày hết hạn */}
          <Box>
            <Typography fontWeight={600} fontSize={14} mb={0.5}>
              Ngày hết hạn
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Checkbox
                size="small"
                checked={dueEnabled}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setDueEnabled(checked);
                  if (checked) {
                    const now = dayjs();
                    const newEndDate = now.add(1, 'day').format('YYYY-MM-DD'); // hôm nay + 1 ngày
                    const newEndTime = now.format('HH:mm'); // giờ hiện tại
                    setEndDate(newEndDate);
                    setEndTime(newEndTime);
                  }
                }}
                sx={{ p: 0.5 }}
              />
              <TextField
                type="date"
                size="small"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!dueEnabled}
                sx={{ width: 150 }}
                InputProps={{
                  sx: { height: 36, borderRadius: 1 },
                }}
              />
              <TextField
                type="time"
                size="small"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!dueEnabled}
                sx={{ width: 105 }}
                InputProps={{
                  sx: { height: 36, borderRadius: 1 },
                }}
              />
            </Box>
          </Box>
        </Box>




        {/* Nút thêm thẻ */}
        <Button
          fullWidth
          variant="contained"
          disabled={!title || !listId}
          onClick={handleAddCard}
          sx={{
            textTransform: "none",
            fontWeight: 500,
            backgroundColor: (!title || !listId) ? "#ccc" : "#0079bf",
            color: (!title || !listId) ? "#666" : "#fff",
            "&:hover": {
              backgroundColor: (!title || !listId) ? "#ccc" : "#026aa7",
            },
            borderRadius: 2
          }}
        >
          Thêm thẻ
        </Button>
      </DialogContent>

    </Dialog>
  );
};

export default AddCardModal;
