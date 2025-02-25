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

const initialLabels = [
  { id: 1, color: "#137b13" },
  { id: 2, color: "#b05900" },
  { id: 3, color: "#d32f2f" },
  { id: 4, color: "#673ab7" },
  { id: 5, color: "#1976d2" },
];

const LabelList = ({ open, onClose, selectedLabels, onSelectLabel }) => {
  const [search, setSearch] = useState("");
  const [labels, setLabels] = useState(initialLabels);
  const [checkedLabels, setCheckedLabels] = useState([]);

  const filteredLabels = labels.filter((label) =>
    label.color.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (id) => {
    const newChecked = checkedLabels.includes(id)
      ? checkedLabels.filter((item) => item !== id)
      : [...checkedLabels, id];
    setCheckedLabels(newChecked);
    onSelectLabel && onSelectLabel(newChecked);
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
      <DialogContent>
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
        <List sx={{ maxHeight: 250, overflowY: "auto" }}>
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
                    }}
                  />
                }
                sx={{ width: "100%" }}
              />
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Nút tạo nhãn mới */}
        <Button
          variant="contained"
          fullWidth
          sx={{ backgroundColor: "#1976d2" }}
        >
          Tạo nhãn mới
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default LabelList;
