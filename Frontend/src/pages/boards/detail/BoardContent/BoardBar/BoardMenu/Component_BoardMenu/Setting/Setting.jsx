import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Checkbox from "@mui/material/Checkbox";
import Comment from "./ChildComponent_Setting/Comment";
import MemberPermission from "./ChildComponent_Setting/Member";

const Setting = ({ open, onClose }) => {
  const [commentPermissionOpen, setCommentPermissionOpen] = useState(false);
  const [memberPermissionOpen, setMemberPermissionOpen] = useState(false);
  const [commentPermission, setCommentPermission] = useState("Thành viên"); // Lưu quyền nhận xét
  const [memberPermission, setMemberPermission] = useState("Thành viên"); // Lưu quyền thành viên

  const toggleCommentPermission = (open) => () => {
    setCommentPermissionOpen(open);
  };

  const toggleMemberPermission = (open) => () => {
    setMemberPermissionOpen(open);
  };

  return (
    <>
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
            Cài đặt
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#000" }}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "#40444B" }} />

        <List sx={{ padding: "16px" }}>
          {/* Không gian làm việc */}
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", color: "#000", marginBottom: "8px" }}
          >
            Không gian làm việc
          </Typography>
          <ListItem>
            <ListItemText
              primary="Không gian làm việc của Ngát"
              sx={{ color: "#000" }}
            />
          </ListItem>

          {/* Quyền */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              color: "#000",
              marginTop: "16px",
              marginBottom: "8px",
            }}
          >
            Quyền
          </Typography>
          <ListItem button onClick={toggleCommentPermission(true)}>
            <ListItemText
              primary="Nhận xét"
              secondary={commentPermission} // Hiển thị quyền nhận xét đã chọn
              sx={{ color: "#000" }}
            />
          </ListItem>
          <ListItem button onClick={toggleMemberPermission(true)}>
            <ListItemText
              primary="Thêm và xóa thành viên"
              secondary={memberPermission} // Hiển thị quyền thành viên đã chọn
              sx={{ color: "#000" }}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Chỉnh sửa Không gian làm việc"
              secondary="Mọi thành viên của Không gian làm việc đều có thể chỉnh sửa và tham gia vào bảng này."
              sx={{ color: "#000" }}
            />
            <Checkbox defaultChecked sx={{ color: "#000" }} />
          </ListItem>

          {/* Trạng thái hoàn tất */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              color: "#000",
              marginTop: "16px",
              marginBottom: "8px",
            }}
          >
            Trạng thái hoàn tất
          </Typography>
          <ListItem>
            <ListItemText
              primary="Hiển thị trạng thái hoàn tất ở mặt trước thẻ"
              sx={{ color: "#000" }}
            />
            <Checkbox defaultChecked sx={{ color: "#000" }} />
          </ListItem>

          {/* Ảnh bìa */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              color: "#000",
              marginTop: "16px",
              marginBottom: "8px",
            }}
          >
            Ảnh bìa
          </Typography>
          <ListItem sx={{ borderRadius: "8px", padding: "12px" }}>
            <ListItemText
              primary="Hiển thị ảnh bìa thẻ"
              secondary="Hiển thị tệp đính kèm hình ảnh và màu sắc ở mặt trước của thẻ."
              sx={{ color: "#000" }}
            />
            <Checkbox defaultChecked sx={{ color: "#000" }} />
          </ListItem>
        </List>
      </Drawer>

      {/* Drawer con mở khi nhấn vào "Nhận xét" */}
      <Comment
        open={commentPermissionOpen}
        onClose={toggleCommentPermission(false)}
        setCommentPermission={setCommentPermission} // Truyền hàm cập nhật state
      />

      {/* Drawer con mở khi nhấn vào "Thêm và xóa thành viên" */}
      <MemberPermission
        open={memberPermissionOpen}
        onClose={toggleMemberPermission(false)}
        setMemberPermission={setMemberPermission} // Truyền hàm cập nhật state
      />
    </>
  );
};

export default Setting;
