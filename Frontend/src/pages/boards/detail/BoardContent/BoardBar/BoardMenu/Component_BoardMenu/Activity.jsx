import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import Avatar from "@mui/material/Avatar";

const activityData = [
  {
    id: 1,
    type: "comment",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn",
    time: "1 giờ trước",
  },

  {
    id: 2,
    type: "activity",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "đã thay đổi miêu tả của bảng này",
    time: "2 giờ trước",
  },

  {
    id: 3,
    type: "comment",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "mmmmmmmm",
    time: "1 giờ trước",
  },

  {
    id: 4,
    type: "comment",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "hhhhhhhhhhh",
    time: "1 giờ trước",
  },
  {
    id: 5,
    type: "activity",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "đã thêm thẻ jjjjj vào danh sách nnnnn",
    time: "2 giờ trước",
  },
  {
    id: 6,
    type: "activity",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "đã thêm danh sách nnnnn vào bảng này",
    time: "2 giờ trước",
  },
  {
    id: 7,
    type: "activity",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "đã thêm bảng này vào nhóm Không gian làm việc của Ngat",
    time: "19 thg 2, 2025",
  },
  {
    id: 8,
    type: "activity",
    user: "Pham Thi Hong Ngat (FPL HN)",
    content: "đã tạo bảng này",
    time: "19 thg 2, 2025",
  },
];

const ActivityDrawer = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [comments, setComments] = useState(activityData);

  const handleDelete = (id) => {
    setComments(comments.filter((c) => c.id !== id));
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 300, p: 1 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" sx={{ fontSize: "0.7rem" }}>
            Hoạt động
          </Typography>
          <IconButton onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Tabs */}
        <Box display="flex" justifyContent="space-between" my={1}>
          <Button
            variant={activeTab === "all" ? "contained" : "outlined"}
            size="small"
            sx={{ fontSize: "0.7rem" }}
            onClick={() => setActiveTab("all")}
          >
            Tất cả
          </Button>
          <Button
            variant={activeTab === "comments" ? "contained" : "outlined"}
            size="small"
            sx={{ fontSize: "0.7rem" }}
            onClick={() => setActiveTab("comments")}
          >
            Bình luận
          </Button>
        </Box>

        <Divider />

        {/* Danh sách hoạt động */}
        <List>
          {comments
            .filter(
              (c) =>
                activeTab === "all" ||
                (activeTab === "comments" && c.type === "comment")
            )
            .map((item) => (
              <ListItem
                key={item.id}
                sx={{ display: "flex", alignItems: "flex-start" }}
              >
                <Avatar
                  sx={{
                    bgcolor: "cyan",
                    marginRight: 1,
                    width: 24,
                    height: 24,
                  }}
                >
                  {item.user[0]}
                </Avatar>
                <Box flexGrow={1}>
                  <Typography
                    fontWeight="bold"
                    variant="body2"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {item.user}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {item.time}
                  </Typography>
                  <Box
                    sx={{
                      color: "#000",
                      p: 0.5,
                      borderRadius: 1,
                      mt: 0.5,
                      wordBreak: "break-word",
                      fontSize: "0.7rem",
                    }}
                  >
                    {item.content}
                  </Box>
                </Box>
                {item.type === "comment" && (
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: "red", marginTop: 0.5 }}
                    size="small"
                  >
                    <DeleteIcon sx={{ fontSize: 10 }} />
                  </IconButton>
                )}
              </ListItem>
            ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default ActivityDrawer;
