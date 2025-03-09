import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Checkbox,
  IconButton,
  Box,
  TextField,
  Button,
  Divider,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";

const initialLabels = [
  { id: 1, color: "#137b13", name: "Label 1" },
  { id: 2, color: "#b05900", name: "Label 2" },
  { id: 3, color: "#d32f2f", name: "Label 3" },
  { id: 4, color: "#673ab7", name: "Label 4" },
  { id: 5, color: "#1976d2", name: "Label 5" },
];

const LabelList = ({ open, onClose, selectedLabels, onSelectLabel }) => {
  const [search, setSearch] = useState("");
  const [labels, setLabels] = useState(initialLabels);
  const [checkedLabels, setCheckedLabels] = useState([]);
  const [editLabelId, setEditLabelId] = useState(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  const filteredLabels = labels.filter((label) =>
    label.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    const newChecked = checkedLabels.includes(id)
      ? checkedLabels.filter((item) => item !== id)
      : [...checkedLabels, id];
    setCheckedLabels(newChecked);
    onSelectLabel && onSelectLabel(newChecked);
  };

  const handleEditLabel = (id, name) => {
    setEditLabelId(id);
    setNewLabelName(name);
  };

  const handleSaveLabelName = () => {
    setLabels((prevLabels) =>
      prevLabels.map((label) =>
        label.id === editLabelId ? { ...label, name: newLabelName } : label
      )
    );
    setEditLabelId(null);
    setNewLabelName("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSaveLabelName();
    }
  };

  const handleCreateLabel = () => {
    const newLabel = {
      id: labels.length + 1,
      color: newLabelColor,
      name: newLabelName,
    };
    setLabels([...labels, newLabel]);
    setIsCreatingLabel(false);
    setNewLabelName("");
    setNewLabelColor("#000000");
  };

  const handleDeleteLabel = (id) => {
    setLabels(labels.filter((label) => label.id !== id));
    setCheckedLabels(checkedLabels.filter((labelId) => labelId !== id));
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          fontSize: "1rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Nhãn
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          "&::-webkit-scrollbar": {
            width: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555",
          },
        }}
      >
        {/* Ô tìm kiếm nhỏ lại */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm nhãn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            width: "80%",
            height: "30px",
            "& .MuiInputBase-root": { height: 30 },
          }}
        />

        {/* Danh sách nhãn dạng checkbox */}
        <List
          sx={{
            maxHeight: 250,
            overflowY: "auto",
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#888",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              backgroundColor: "#555",
            },
          }}
        >
          {filteredLabels.map((label) => (
            <ListItem key={label.id} disablePadding>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkedLabels.includes(label.id)}
                    onChange={() => handleToggle(label.id)}
                  />
                }
                label={
                  <Box
                    sx={{
                      width: "300px", // Thanh màu dài ra
                      height: 24,
                      backgroundColor: label.color,
                      borderRadius: "4px",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 8px",
                      "&:hover::after": {
                        content: `"${label.name}"`,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {editLabelId === label.id && (
                      <TextField
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onBlur={handleSaveLabelName}
                        onKeyPress={handleKeyPress}
                        size="small"
                        autoFocus
                        sx={{
                          width: "80%",
                          "& .MuiOutlinedInput-root": {
                            "& fieldset": {
                              border: "none",
                            },
                          },
                        }}
                      />
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleEditLabel(label.id, label.name)}
                      sx={{ width: 24, height: 24 }}
                    >
                      <EditIcon sx={{ fontSize: 12, color: "#fff" }} />
                    </IconButton>
                  </Box>
                }
                // sx={{ width: "100%" }}
              />
              <IconButton
                size="small"
                onClick={() => handleDeleteLabel(label.id)}
                sx={{ width: 24, height: 24, marginLeft: 1 }}
              >
                <CloseIcon sx={{ fontSize: 12, color: "#000" }} />
              </IconButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Form tạo nhãn mới */}
        {isCreatingLabel ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Tên nhãn mới"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
            />
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              type="color"
              value={newLabelColor}
              onChange={(e) => setNewLabelColor(e.target.value)}
            />
            <Button
              variant="contained"
              fullWidth
              sx={{ backgroundColor: "#1976d2" }}
              onClick={handleCreateLabel}
            >
              Lưu nhãn
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setIsCreatingLabel(false)}
            >
              Hủy
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            sx={{ backgroundColor: "#1976d2" }}
            onClick={() => setIsCreatingLabel(true)}
          >
            Tạo nhãn mới
          </Button>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LabelList;
