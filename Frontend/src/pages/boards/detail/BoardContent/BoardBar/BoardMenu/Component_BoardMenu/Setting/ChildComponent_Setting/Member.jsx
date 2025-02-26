import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";

const MemberPermission = ({ open, onClose, setMemberPermission }) => {
  const [selectedOption, setSelectedOption] = useState("Thành viên");

  const handleOptionChange = (event) => {
    const newValue = event.target.value;
    setSelectedOption(newValue);
    setMemberPermission(newValue); // Cập nhật state ở `Setting.js`
    onClose(); // Đóng drawer sau khi chọn
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 320,
          backgroundColor: "#fff",
          color: "#000",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Typography variant="h6" sx={{ color: "#000" }}>
          Thêm/Loại bỏ quyền
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#ddd" }} />

      {/* Danh sách quyền */}
      <List sx={{ padding: "16px" }}>
        <RadioGroup value={selectedOption} onChange={handleOptionChange}>
          <FormControlLabel
            value="Quản trị viên"
            control={<Radio sx={{ color: "#000" }} />}
            label="Quản trị viên"
          />
          <Typography
            variant="body2"
            sx={{ color: "#666", marginLeft: "32px", marginTop: "-8px" }}
          >
            Chỉ cho phép các quản trị viên thêm và loại bỏ thành viên khỏi bảng
            này.
          </Typography>

          <FormControlLabel
            value="Tất cả thành viên"
            control={<Radio sx={{ color: "#000" }} />}
            label="Tất cả thành viên"
          />
          {/* Thêm mô tả bên dưới "Tất cả thành viên" */}
          <Typography
            variant="body2"
            sx={{ color: "#666", marginLeft: "32px", marginTop: "-8px" }}
          >
            Cho phép mọi thành viên và quản trị viên thêm và loại bỏ thành viên
            khỏi bảng này.
          </Typography>
        </RadioGroup>
      </List>
    </Drawer>
  );
};

export default MemberPermission;
