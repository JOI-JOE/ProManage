import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";

const Comment = ({ open, onClose, setCommentPermission }) => {
  const [selectedOption, setSelectedOption] = useState("Thành viên");

  const handleOptionChange = (event) => {
    const newValue = event.target.value;
    setSelectedOption(newValue);
    setCommentPermission(newValue); // Cập nhật luôn ở Setting.js
    onClose(); // Đóng Drawer
  };

  const options = [
    { label: "Đã tắt", description: "Không ai có thể bình luận và phản ứng." },
    {
      label: "Thành viên",
      description:
        "Quản trị viên và Thành viên bảng có thể bình luận và phản ứng.",
    },
    {
      label: "Thành viên và người quan sát",
      description:
        "Quản trị viên, Thành viên bảng và Người theo dõi có thể bình luận và phản ứng.",
    },
    {
      label: "Các thành viên Không gian làm việc",
      description:
        "Quản trị viên, Thành viên bảng, Người theo dõi và Thành viên nhóm có thể bình luận và phản ứng.",
    },
    {
      label: "Bất kỳ Người dùng Trello nào",
      description:
        "Bất kỳ Người dùng Trello nào có thể bình luận và phản ứng miễn là họ có thể nhìn thấy bảng này.",
    },
  ];

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
          Quyền bình luận
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ borderColor: "#40444B" }} />

      <List sx={{ padding: "16px" }}>
        <RadioGroup value={selectedOption} onChange={handleOptionChange}>
          {options.map((option) => (
            <ListItem
              key={option.label}
              button
              onClick={() =>
                handleOptionChange({ target: { value: option.label } })
              }
            >
              <FormControlLabel
                value={option.label}
                control={<Radio sx={{ color: "#000" }} />}
                label={
                  <Box>
                    <Typography
                      variant="body1"
                      sx={{ color: "#000", fontWeight: "bold" }}
                    >
                      {option.label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#000" }}>
                      {option.description}
                    </Typography>
                  </Box>
                }
                sx={{ flex: 1 }}
              />
            </ListItem>
          ))}
        </RadioGroup>
      </List>
    </Drawer>
  );
};

export default Comment;
