import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

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
import {
  useCardLabels,
  useCreateLabel,
  useDeleteLabelByBoard,
  useLabels,
  useUpdateCardLabel,
  useUpdateLabelName,
} from "../../../../../../../../../../hooks/useLabel";

// const initialLabels = [
//   { id: 1, color: "#137b13", name: "Label 1" },
//   { id: 2, color: "#b05900", name: "Label 2" },
//   { id: 3, color: "#d32f2f", name: "Label 3" },
//   { id: 4, color: "#673ab7", name: "Label 4" },
//   { id: 5, color: "#1976d2", name: "Label 5" },
// ];

const LabelList = ({ open, onClose, selectedLabels, onSelectLabel }) => {
  const [search, setSearch] = useState("");
  const { boardId } = useParams();
  const { cardId } = useParams();
  const queryClient = useQueryClient();
  const { data: fetchedLabels } = useLabels(boardId);
  const { data: fetchedCardLabels } = useCardLabels(cardId);
  // Cập nhật labels khi fetchedLabels thay đổi
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateCardLabel();
  const deleteLabelMutation = useDeleteLabelByBoard();
  const updateLabelNameMutation = useUpdateLabelName(); //
  const [labels, setLabels] = useState([]);
  const [checkedLabels, setCheckedLabels] = useState(new Set(selectedLabels));
  // const [editLabelId, setEditLabelId] = useState(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [editLabelId, setEditLabelId] = useState("");
  const [NewUpdatedLabelName, setUpdatedLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  useEffect(() => {
    if (fetchedLabels) {
      setLabels(fetchedLabels); // Cập nhật danh sách nhãn từ board
    }
    if (fetchedCardLabels) {
      setCheckedLabels(new Set(fetchedCardLabels.map((label) => label.id))); // Đánh dấu các nhãn đã được gán vào thẻ
    }
  }, [fetchedLabels, fetchedCardLabels]);

  // tạo mới
  // console.log(createLabelMutation);
  // console.log("updateLabelNameMutation:", updateLabelNameMutation);
  // console.log("updateLabelNameMutation.mutate:", updateLabelNameMutation?.mutate);

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
  // sửa tên

  const handleUpdateLabelName = () => {
    if (!NewUpdatedLabelName.trim()) return;

    if (!NewUpdatedLabelName) {
      console.error("Hook useUpdateLabelName chưa được khởi tạo!");
      return;
    }

    updateLabelNameMutation.mutate(
      { labelId: editLabelId, data: { title: NewUpdatedLabelName } },
      {
        onSuccess: () => {
          setLabels((prevLabels) =>
            prevLabels.map((label) =>
              label.id === editLabelId
                ? { ...label, title: NewUpdatedLabelName }
                : label
            )
          );
          setIsEditingLabel(false);
          setEditLabelId(null);
          setUpdatedLabelName("");
          queryClient.invalidateQueries(["labels", boardId]);
        },
        onError: (error) => {
          console.error(error);
        },
      }
    );
  };
  const handleCheckboxChange = (labelId) => {
    setCheckedLabels((prev) => {
      const updated = new Set(prev);

      if (updated.has(labelId)) {
        updated.delete(labelId);
      } else {
        updated.add(labelId);
      }
      // Gọi API với giá trị mới thay vì `checkedLabels`
      updateLabelMutation.mutate(
        { cardId, labelId, action: updated.has(labelId) ? "add" : "remove" },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["labels"] });
          },
        }
      );

      return new Set(updated);
    });
  };
  const handleDeleteLabel = (labelId) => {
    deleteLabelMutation.mutate({ labelId });
  };

  // Xử lý khi đang tải hoặc lỗi
  const filteredLabels = labels.filter((label) =>
    label.title.toLowerCase().includes(search.toLowerCase())
  );

  // const handleToggle = (id) => {
  //   const newChecked = checkedLabels.includes(id)
  //     ? checkedLabels.filter((item) => item !== id)
  //     : [...checkedLabels, id];
  //   setCheckedLabels(newChecked);
  //   onSelectLabel && onSelectLabel(newChecked);
  // };

  const handleEditLabel = (id, title) => {
    console.log(id, title);
    setEditLabelId(id);
    setIsEditingLabel(true);
    setUpdatedLabelName("");
  };

  // const handleSaveLabelName = () => {
  //   setLabels((prevLabels) =>
  //     prevLabels.map((label) =>
  //       label.id === editLabelId ? { ...label, name: newLabelName } : label
  //     )
  //   );
  //   setEditLabelId(null);
  //   setNewLabelName("");
  // };

  // const handleKeyPress = (event) => {
  //   if (event.key === "Enter") {
  //     handleUpdateLabelName();
  //   }
  // };
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn chặn reload
      handleUpdateLabelName(); // Cập nhật tên nhãn
      setIsEditingLabel(false); // Thoát chế độ chỉnh sửa
    }
  };

  // const handleCreateLabel = () => {
  //   const newLabel = {
  //     id: labels.length + 1,
  //     color: newLabelColor,
  //     name: newLabelName,
  //   };
  //   setLabels([...labels, newLabel]);
  //   setIsCreatingLabel(false);
  //   setNewLabelName("");
  //   setNewLabelColor("#000000");
  // };

  // const handleDeleteLabel = (id) => {
  //   setLabels(labels.filter((label) => label.id !== id));
  //   setCheckedLabels(checkedLabels.filter((labelId) => labelId !== id));
  // };
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
                    checked={checkedLabels.has(label.id)}
                    onChange={() => handleCheckboxChange(label.id)}
                  />
                }
                label={
                  <Box
                    sx={{
                      width: "300px", // Thanh màu dài ra
                      height: 24,
                      backgroundColor: label.color.hex_code,
                      borderRadius: "4px",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "0 8px",
                      "&:hover::after": {
                        content: `"${label.title}"`,
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        color: "#fff",
                        fontSize: "0.4rem",
                        fontWeight: "bold",
                      },
                    }}
                  >
                    {isEditingLabel && editLabelId === label.id ? (
                      <TextField
                        value={NewUpdatedLabelName}
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
                          },
                        }}
                      />
                    ) : null}
                    <IconButton
                      size="small"
                      onClick={() => {
                        handleEditLabel(label.id, label.title);
                      }}
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
