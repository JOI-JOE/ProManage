import React, { useState } from "react";
import {
  Drawer,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  Divider,
  Box,
} from "@mui/material";

const MenuCalendar = ({ open, onClose }) => {
  const [selectedBoards, setSelectedBoards] = useState([]);
  const [isBoardSelected, setIsBoardSelected] = useState(false);

  const [isListSelected, setIsListSelected] = useState(false);
  const [selectedLists, setSelectedLists] = useState([]);

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isMemberSelected, setIsMemberSelected] = useState(false);

  const members = [
    { id: "1", name: "Hồng Ngát", username: "hongngat161102" },
    { id: "2", name: "Ngôn Tố", username: "tieuthat07402" },
  ];

  const lists = [
    { id: "1", name: "Column 1" },
    { id: "2", name: "Column 2" },
    { id: "3", name: "Column 3" },
  ];

  const boards = [
    {
      id: "1",
      name: "Bảng 1",
      image:
        "https://i.pinimg.com/736x/ff/df/a4/ffdfa4e4981626865d139d37d0f74e42.jpg",
    },
    {
      id: "2",
      name: "Bảng 2",
      image:
        "https://i.pinimg.com/736x/e4/25/87/e4258704c8d65883256a73d70f118389.jpg",
    },
    {
      id: "3",
      name: "Bảng 3",
      image:
        "https://i.pinimg.com/736x/e8/90/40/e89040791fa5a9cdf2a9f45bfa1f2db0.jpg",
    },
  ];

  const handleSelectMember = (id) => {
    setSelectedMembers((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const handleSelectList = (id) => {
    setSelectedLists((prev) =>
      prev.includes(id) ? prev.filter((l) => l !== id) : [...prev, id]
    );
  };

  const handleSelectBoard = (id) => {
    setSelectedBoards((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, padding: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Lọc</Typography>
        </Box>
        <Divider sx={{ my: 2 }} />

        {/* Bảng */}
        <Box display="flex" alignItems="center" sx={{ ml: -1.27 }}>
          <Checkbox
            checked={isBoardSelected}
            onChange={() => setIsBoardSelected(!isBoardSelected)}
          />
          <Select
            fullWidth
            displayEmpty
            value={selectedBoards}
            onChange={(e) => handleSelectBoard(e.target.value)}
            renderValue={() => "Bảng gần đây"}
            multiple
            variant="standard" // Bỏ border
            disableUnderline={true}
            sx={{ fontSize: "0.7rem" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxWidth: 300, // Giới hạn chiều rộng dropdown
                  maxHeight: 200, // Giới hạn chiều cao dropdown
                  overflow: "auto",
                },
              },
            }}
          >
            {boards.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                <Checkbox
                  checked={selectedBoards.includes(board.id)}
                  onChange={() => handleSelectBoard(board.id)}
                />
                <img
                  src={board.image}
                  alt={board.name}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                <Typography variant="body2">{board.name}</Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>

        <Box>
          <Select
            fullWidth
            value={selectedBoards}
            onChange={(e) => handleSelectBoard(e.target.value)}
            displayEmpty
            renderValue={() => "Chọn bảng"}
            multiple
            variant="standard"
            disableUnderline={true}
            sx={{ fontSize: "0.7rem" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 200,
                  overflow: "auto",
                },
              },
            }}
          >
            {boards.map((board) => (
              <MenuItem key={board.id} value={board.id}>
                <Checkbox
                  checked={selectedBoards.includes(board.id)}
                  onChange={() => handleSelectBoard(board.id)}
                />
                <img
                  src={board.image}
                  alt={board.name}
                  style={{ width: 24, height: 24, marginRight: 8 }}
                />
                <Typography variant="body2">{board.name}</Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>
        {/* Từ khóa */}
        <TextField
          fullWidth
          placeholder="Nhập từ khóa..."
          variant="outlined"
          sx={{ my: 2 }}
          inputProps={{
            sx: { height: 30, padding: "4px 8px", fontSize: "0.7rem" },
          }}
        />

        {/* Thành viên */}
        <Typography variant="h6">Thành viên</Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="Không có thành viên"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Các thẻ đã chỉ định cho tôi"
          />
        </FormGroup>

        {/* Checkbox + Dropdown chọn thành viên */}
        <Box display="flex" alignItems="center" sx={{ ml: -1.27 }}>
          <Checkbox
            checked={isMemberSelected}
            onChange={() => setIsMemberSelected(!isMemberSelected)}
          />
          <Select
            fullWidth
            displayEmpty
            value={selectedMembers}
            onChange={(e) => handleSelectMember(e.target.value)}
            renderValue={() => "Chọn thành viên"}
            multiple
            variant="standard" // Bỏ border
            disableUnderline={true}
            sx={{ fontSize: "0.7rem" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxWidth: 300, // Giới hạn chiều rộng dropdown
                  maxHeight: 200, // Giới hạn chiều cao dropdown
                  overflow: "auto",
                },
              },
            }}
          >
            {members.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                <Checkbox
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => handleSelectMember(member.id)}
                />
                <Box display="flex" alignItems="center">
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", mr: 1 }}
                  >
                    {member.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    @{member.username}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Card status */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Card status
        </Typography>
        <FormGroup>
          <FormControlLabel
            control={<Checkbox />}
            label="Đã đánh dấu hoàn thành"
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Không được đánh dấu là đã hoàn thành"
          />
        </FormGroup>

        {/* Danh sách */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Danh sách
        </Typography>
        <Box display="flex" alignItems="center" sx={{ ml: -1.27 }}>
          <Checkbox
            checked={isListSelected}
            onChange={() => setIsListSelected(!isListSelected)}
          />
          <Select
            fullWidth
            displayEmpty
            value={selectedLists}
            onChange={(e) => handleSelectList(e.target.value)}
            renderValue={() => "Chọn danh sách"}
            multiple
            variant="standard"
            disableUnderline={true}
            sx={{ fontSize: "0.7rem" }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxWidth: 300,
                  maxHeight: 150,
                  overflow: "auto",
                  mt: 1,
                },
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Hồng Ngát
              </Typography>
            </MenuItem>
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id} sx={{}}>
                <Checkbox
                  checked={selectedLists.includes(list.id)}
                  onChange={() => handleSelectList(list.id)}
                />
                <Typography variant="body2">{list.name}</Typography>
              </MenuItem>
            ))}
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                Hồng Ngát 1
              </Typography>
            </MenuItem>
            {lists.map((list) => (
              <MenuItem key={list.id} value={list.id} sx={{ py: 0 }}>
                <Checkbox
                  checked={selectedLists.includes(list.id)}
                  onChange={() => handleSelectList(list.id)}
                />
                <Typography variant="body2">{list.name}</Typography>
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Nhãn */}
        <Typography variant="h6" sx={{ mt: 2 }}>
          Nhãn
        </Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox />} label="Không có Nhãn" />
          <FormControlLabel control={<Checkbox />} label="Chọn nhãn" />
        </FormGroup>
      </Box>
    </Drawer>
  );
};

export default MenuCalendar;
