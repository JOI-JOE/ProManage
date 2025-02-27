import React, { useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

const initialLabels = [
  { id: 1, name: "Màu xanh lá", color: "#2E7D32" },
  { id: 2, name: "Màu vàng cam", color: "#FF8F00" },
  { id: 3, name: "Màu đỏ ", color: "#D84315" },
];

const colors = [
  "#2E7D32",
  "#FF8F00",
  "#D84315",
  "#C62828",
  "#6A1B9A",
  "#283593",
  "#f39c12",
  "#e67e22",
  "#d35400",
  "#c0392b",
  "#e74c3c",
  "#8e44ad",
  "#3498db",
  "#1abc9c",
  "#2ecc71",
  "#f1c40f",
  "#6F1E51",
  "#9b59b6",
  "#ED4C67",
];

const ColorBox = styled(Box)(({ color }) => ({
  width: "100%",
  height: 40,
  backgroundColor: color,
  borderRadius: 4,
  position: "relative",
  cursor: "pointer",
  "&:hover .label-name": {
    opacity: 1, // Chỉ hiển thị khi hover
  },
}));

const LabelName = styled(Typography)({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "white",
  fontWeight: "bold",
  fontSize: "0.5rem",
  opacity: 0, // Mặc định ẩn
  transition: "opacity 0.3s",
});

const LabelList = ({ open, onClose }) => {
  const [labels, setLabels] = useState(initialLabels);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: "", color: colors[0] });
  const [editingLabelId, setEditingLabelId] = useState(null);
  const [editingLabelName, setEditingLabelName] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);

  const addLabel = () => {
    setLabels([...labels, { id: labels.length + 1, ...newLabel }]);
    setNewLabel({ name: "", color: colors[0] });
    setShowForm(false);
  };

  const handleLabelClick = (label) => {
    setEditingLabelId(label.id);
    setEditingLabelName(label.name);
  };

  const handleLabelNameChange = (e) => {
    setEditingLabelName(e.target.value);
  };

  const handleLabelNameBlur = () => {
    setLabels(
      labels.map((label) =>
        label.id === editingLabelId
          ? { ...label, name: editingLabelName }
          : label
      )
    );
    setEditingLabelId(null);
    setEditingLabelName("");
  };

  const handleLabelNameKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLabelNameBlur();
    }
  };

  const handleColorClick = (color) => {
    setSelectedColor(color);
    setNewLabel({ ...newLabel, color });
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: 300,
          p: 2,
          bgcolor: "#fff",
          color: "black",
          position: "relative",
        }}
      >
        <IconButton
          sx={{ position: "absolute", top: 8, right: 8 }}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" gutterBottom>
          Nhãn
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Tìm nhãn..."
          fullWidth
          size="small"
          sx={{ bgcolor: "white", borderRadius: 1, mb: 2 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <List>
          {labels
            .filter((label) =>
              label.name.toLowerCase().includes(search.toLowerCase())
            )
            .map((label) => (
              <ListItem key={label.id} sx={{ p: 0, mb: 1 }}>
                <ColorBox color={label.color}>
                  {editingLabelId === label.id ? (
                    <TextField
                      value={editingLabelName}
                      onChange={handleLabelNameChange}
                      onBlur={handleLabelNameBlur}
                      autoFocus
                      size="small"
                      onKeyPress={handleLabelNameKeyPress}
                      sx={{
                        bgcolor: "white",
                        borderRadius: 1,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  ) : (
                    <LabelName
                      className="label-name"
                      onClick={() => handleLabelClick(label)}
                    >
                      {label.name || "Click to add name"}
                    </LabelName>
                  )}
                </ColorBox>
              </ListItem>
            ))}
        </List>

        {showForm ? (
          <Box sx={{ mt: 2, bgcolor: "#f0f0f0", p: 2, borderRadius: 1 }}>
            <TextField
              variant="outlined"
              placeholder="Tên nhãn..."
              fullWidth
              size="small"
              sx={{ bgcolor: "white", borderRadius: 1, mb: 1 }}
              value={newLabel.name}
              onChange={(e) =>
                setNewLabel({ ...newLabel, name: e.target.value })
              }
            />
            <Typography variant="body2" sx={{ mb: 1 }}>
              Chọn màu:
            </Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {colors.map((color) => (
                <Box
                  key={color}
                  sx={{
                    width: 30,
                    height: 30,
                    backgroundColor: color,
                    borderRadius: "50%",
                    cursor: "pointer",
                    border:
                      newLabel.color === color
                        ? "2px solid white"
                        : "2px solid transparent",
                  }}
                  onClick={() => handleColorClick(color)}
                />
              ))}
            </Box>
            <Button
              variant="contained"
              fullWidth
              sx={{ mt: 2, bgcolor: "#FF8F00" }}
              onClick={addLabel}
            >
              Thêm nhãn
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() => setShowForm(false)}
            >
              Hủy
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2, bgcolor: "teal" }}
            onClick={() => setShowForm(true)}
          >
            Tạo nhãn mới
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default LabelList;
