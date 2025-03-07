import React, { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import Divider from "@mui/material/Divider";
import CommentIcon from "@mui/icons-material/Comment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DescriptionIcon from "@mui/icons-material/Description";

const initialArchivedItems = [
  { id: 1, name: "Thẻ 1", comments: 5 },
  { id: 2, name: "Thẻ 2", comments: 3 },
  { id: 3, name: "nnnnn", comments: 0 },
  { id: 4, name: "New board", comments: 2 },
  { id: 5, name: "Test", comments: 1 },
  { id: 6, name: "Quốc", comments: 4 },
];

const Archived = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [archivedItems, setArchivedItems] = useState(initialArchivedItems);
  const [viewMode, setViewMode] = useState("cards");

  const handleRestore = (id) => {
    setArchivedItems(archivedItems.filter((item) => item.id !== id));
  };

  const handleDelete = (id) => {
    setArchivedItems(archivedItems.filter((item) => item.id !== id));
  };

  const filteredItems = archivedItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 350, p: 2, backgroundColor: "#fff", color: "#000" }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Mục đã lưu trữ</Typography>
          <IconButton onClick={onClose} sx={{ color: "#000" }}>
            <CloseIcon sx={{ fontSize: "14px" }} />
          </IconButton>
        </Box>

        {/* Search Bar và Button chuyển đổi */}
        <Box display="flex" gap={1} mt={2}>
          <TextField
            variant="outlined"
            placeholder="Tìm kiếm ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: 170 }}
            InputProps={{
              style: {
                fontSize: "0.6rem",
                backgroundColor: "#f0f0f0",
                color: "#000",
              },
            }}
          />
          <Button
            variant="contained"
            onClick={() =>
              setViewMode(viewMode === "cards" ? "lists" : "cards")
            }
            sx={{
              backgroundColor: "teal",
              color: "#fff",
              textTransform: "none",
              fontSize: "0.6rem",
            }}
          >
            {viewMode === "cards" ? "Danh sách lưu trữ" : "Thẻ lưu trữ"}
          </Button>
        </Box>

        <Divider sx={{ backgroundColor: "#ccc", my: 2 }} />

        {/* Hiển thị danh sách theo chế độ */}
        {viewMode === "cards" ? (
          <List>
            {filteredItems.map((item) => (
              <ListItem
                key={item.id}
                sx={{ backgroundColor: "#f0f0f0", borderRadius: 2, my: 1 }}
              >
                <ListItemText
                  primary={
                    <Typography sx={{ fontWeight: "bold", fontSize: "0.6rem" }}>
                      {item.name}
                    </Typography>
                  }
                  sx={{ color: "#000" }}
                />
                <Box display="flex" alignItems="center">
                  <IconButton
                    onClick={() => handleDelete(item.id)}
                    sx={{ color: "red", fontSize: "16px" }}
                  >
                    <DeleteIcon sx={{ fontSize: "16px" }} />
                  </IconButton>
                  <IconButton
                    onClick={() => handleRestore(item.id)}
                    sx={{ color: "teal", fontSize: "16px" }}
                  >
                    <RestoreIcon sx={{ fontSize: "16px" }} />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        ) : (
          <Box>
            {filteredItems.map((item) => (
              <Box
                key={item.id}
                sx={{
                  backgroundColor: "#f0f0f0",
                  p: 2,
                  borderRadius: 2,
                  my: 1,
                }}
              >
                <Typography
                  variant="body1"
                  sx={{ color: "#000", fontSize: "0.6rem", fontWeight: "bold" }}
                >
                  {item.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#555", fontSize: "0.6rem" }}
                >
                  Đã lưu trữ
                </Typography>
                <Box mt={-0.5} display="flex" justifyContent="space-between">
                  <Button
                    sx={{
                      color: "teal",
                      fontSize: "0.6rem",
                      paddingLeft: 0, // Set padding left to 0
                    }}
                  >
                    Gửi tới bảng thông tin
                  </Button>
                  <Button
                    sx={{
                      color: "red",
                      fontSize: "0.6rem",
                    }}
                    onClick={() => handleDelete(item.id)}
                  >
                    Xóa
                  </Button>
                </Box>
                <Box mt={-0.5} display="flex" justifyContent="flex-start">
                  <Box display="flex" alignItems="center" gap={0.2}>
                    <CommentIcon sx={{ fontSize: "10px", color: "#000" }} />
                    <Typography
                      ml={-0.7}
                      sx={{ fontSize: "0.5rem", color: "#000" }}
                    >
                      {item.comments}
                    </Typography>
                  </Box>
                  <IconButton sx={{ color: "#000", fontSize: "10px" }}>
                    <VisibilityIcon sx={{ fontSize: "10px" }} />
                  </IconButton>
                  <IconButton sx={{ color: "#000", fontSize: "10px" }}>
                    <DescriptionIcon sx={{ fontSize: "10px" }} />
                  </IconButton>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Archived;
