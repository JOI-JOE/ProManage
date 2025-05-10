import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  IconButton,
  Box,
  TextField,
  Button,
  Divider,
  Grid,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useCreateLabel, useDeleteLabelByBoard, useLabels, useUpdateLabelName } from "../../../../../../../../hooks/useLabel";
import { useParams } from "react-router-dom";

// Màu cố định giống Trello
const LABEL_COLORS = [
  { hex_code: "#61bd4f", name: "Xanh lá" },
  { hex_code: "#f2d600", name: "Vàng" },
  { hex_code: "#ff9f1a", name: "Cam" },
  { hex_code: "#eb5a46", name: "Đỏ" },
  { hex_code: "#c377e0", name: "Tím" },
  { hex_code: "#0079bf", name: "Xanh dương" },
  { hex_code: "#00c2e0", name: "Xanh da trời" },
  { hex_code: "#51e898", name: "Xanh mint" },
  { hex_code: "#ff78cb", name: "Hồng" },
  { hex_code: "#344563", name: "Xanh đen" },
  { hex_code: "#b3bac5", name: "Xám" },
  { hex_code: "#4d4d4d", name: "Đen" },
  { hex_code: "#cd8de5", name: "Tím nhạt" },
  { hex_code: "#5ba4cf", name: "Xanh biển" },
  { hex_code: "#29cce5", name: "Xanh ngọc" },
  { hex_code: "#ff5252", name: "Đỏ tươi" },
  { hex_code: "#7986cb", name: "Indigo" },
  { hex_code: "#8d6e63", name: "Nâu" },
];

const LabelList = ({ open, onClose }) => {
  const { boardId } = useParams();
  
  const { data: fetchedLabels } = useLabels(boardId);
  const createLabelMutation = useCreateLabel();
  const updateLabelNameMutation = useUpdateLabelName();
  const deleteLabelMutation = useDeleteLabelByBoard();
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [editLabelId, setEditLabelId] = useState("");
  const [newUpdatedLabelName, setUpdatedLabelName] = useState("");
  const [search, setSearch] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  useEffect(() => {
    if (fetchedLabels) setLabels(fetchedLabels);
  }, [fetchedLabels]);

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      alert("Tên nhãn không được để trống!");
      return;
    }
    createLabelMutation.mutate(
      { boardId, data: { title: newLabelName, color: newLabelColor } },
      {
        onSuccess: () => {
          setIsCreatingLabel(false);
          setNewLabelName("");
          setNewLabelColor("#000000");
        },
      }
    );
  };

  const handleUpdateLabelName = () => {
    if (!newUpdatedLabelName.trim()) {
      alert("Tên nhãn không được để trống!");
      return;
    }
    updateLabelNameMutation.mutate(
      { labelId: editLabelId, data: { title: newUpdatedLabelName } },
      {
        onSuccess: () => {
          setLabels((prevLabels) =>
            prevLabels.map((label) =>
              label.id === editLabelId
                ? { ...label, title: newUpdatedLabelName }
                : label
            )
          );
          setIsEditingLabel(false);
          setEditLabelId(null);
          setUpdatedLabelName("");
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  };

  const handleDeleteLabel = (labelId) => {
    deleteLabelMutation.mutate(
      { labelId },
      {
        onSuccess: () => {},
      }
    );
  };

  const filteredLabels = labels.filter((label) =>
    label.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleEditLabel = (id, title) => {
    setEditLabelId(id);
    setIsEditingLabel(true);
    setUpdatedLabelName(title);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleUpdateLabelName();
      setIsEditingLabel(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          fontSize: "17px",
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
          {filteredLabels.length === 0 ? (
            <ListItem>
              <Box sx={{ width: "100%", textAlign: "center", color: "#999" }}>
                Chưa có nhãn nào
              </Box>
            </ListItem>
          ) : (
            filteredLabels.map((label) => (
              <ListItem key={label.id} disablePadding>
                <Box
                  sx={{
                    width: "370px",
                    height: 27,
                    marginBottom: "10px",
                    backgroundColor: label?.color?.hex_code,
                    borderRadius: "4px",
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 8px",
                    color: "#fff",
                    fontSize: "0.578rem",
                    fontWeight: "bold",
                  }}
                >
                  {isEditingLabel && editLabelId === label.id ? (
                    <TextField
                      value={newUpdatedLabelName}
                      onChange={(e) => setUpdatedLabelName(e.target.value)}
                      onBlur={handleUpdateLabelName}
                      onKeyPress={handleKeyPress}
                      size="small"
                      autoFocus
                      sx={{
                        width: "80%",
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            border: "none",
                          },
                          "& input": {
                            color: "#fff",
                          },
                        },
                      }}
                    />
                  ) : (
                    label.title
                  )}
                  <IconButton
                    size="small"
                    onClick={() => handleEditLabel(label.id, label.title)}
                    sx={{ width: 24, height: 24 }}
                  >
                    <EditIcon sx={{ fontSize: 12, color: "#fff" }} />
                  </IconButton>
                </Box>
                {/* <IconButton
                  size="small"
                  onClick={() => handleDeleteLabel(label.id)}
                  sx={{ width: 24, height: 24, marginLeft: 1 }}
                >
                  <CloseIcon sx={{ fontSize: 16, color: "#000" }} />
                </IconButton> */}
              </ListItem>
            ))
          )}
        </List>

        <Divider sx={{ my: 2 }} />
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
            {/* Bảng chọn màu cố định */}
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {LABEL_COLORS.map((color) => (
                <Grid item key={color.hex_code} xs={2}>
                  <Box
                    onClick={() => setNewLabelColor(color.hex_code)}
                    sx={{
                      width: 50,
                      height: 24,
                      backgroundColor: color.hex_code,
                      borderRadius: "4px",
                      cursor: "pointer",
                      border:
                        newLabelColor === color.hex_code
                          ? "2px solid #000"
                          : "none",
                      transition: "transform 0.2s",
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    }}
                    title={color.name}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Hiển thị màu đã chọn */}
            <Box
              sx={{
                width: "100%",
                height: 32,
                backgroundColor: newLabelColor,
                borderRadius: "4px",
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              {newLabelName || "Xem trước nhãn mới"}
            </Box>

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