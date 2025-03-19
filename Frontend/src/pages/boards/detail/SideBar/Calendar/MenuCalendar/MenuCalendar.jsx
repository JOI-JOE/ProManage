import React, { useState } from "react";
import {
  Drawer,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  TextField,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FolderIcon from "@mui/icons-material/Folder";
import PersonIcon from "@mui/icons-material/Person";
import LabelIcon from "@mui/icons-material/Label";

const MenuCalendar = ({ open, onClose }) => {
  const [filters, setFilters] = useState({
    hasMember: false,
    assignedToMe: false,
    completed: false,
    notCompleted: false,
    noLabel: false,
  });

  const members = [
    { id: "hongngat161102", username: "hongngat161102", avatar: "H" },
    { id: "tieuthat07402", username: "tieuthat07402", avatar: "T" },
  ];

  const handleCheckboxChange = (name) => (event) => {
    setFilters({ ...filters, [name]: event.target.checked });
  };

  return (
    <Drawer id="menu-calendar" anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
          Lọc
        </Typography>

        {/* Chọn bảng */}
        <List>
          <ListItem>
            <Checkbox checked />
            <FolderIcon sx={{ mr: 1, color: "#ffcc80" }} />
            <ListItemText primary="Bảng Gần Đây" />
            <Typography variant="body2" sx={{ ml: "auto", color: "gray" }}>
              2
            </Typography>
          </ListItem>
        </List>

        <Divider sx={{ my: 1 }} />

        {/* Tìm kiếm từ khóa */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Nhập từ khóa..."
          sx={{ mb: 2 }}
        />

        {/* Thành viên */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Thành viên</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.hasMember}
                  onChange={handleCheckboxChange("hasMember")}
                />
              }
              label="Không có thành viên"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.assignedToMe}
                  onChange={handleCheckboxChange("assignedToMe")}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <PersonIcon sx={{ mr: 1, color: "#26a69a" }} />
                  Các thẻ đã chỉ định cho tôi
                </Box>
              }
            />
          </AccordionDetails>
        </Accordion>

        {/* Trạng thái thẻ */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Card status</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.completed}
                  onChange={handleCheckboxChange("completed")}
                />
              }
              label="Đã đánh dấu hoàn thành"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.notCompleted}
                  onChange={handleCheckboxChange("notCompleted")}
                />
              }
              label="Không được đánh dấu là đã hoàn thành"
            />
          </AccordionDetails>
        </Accordion>

        {/* Nhãn */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography>Nhãn</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.noLabel}
                  onChange={handleCheckboxChange("noLabel")}
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <LabelIcon sx={{ mr: 1, color: "#f44336" }} />
                  Không có Nhãn
                </Box>
              }
            />
          </AccordionDetails>
        </Accordion>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onClose}
        >
          Đóng
        </Button>
      </Box>
    </Drawer>
  );
};

export default MenuCalendar;
