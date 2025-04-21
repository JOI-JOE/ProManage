import React, { useState, useEffect } from "react";
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
import { useCardLabels, useCreateLabel, useDeleteLabelByBoard, useLabels, useUpdateCardLabel, useUpdateLabelName } from "../../../../../../hooks/useTableView";

// import {
//   useCardLabels,
//   useCreateLabel,
//   useDeleteLabelByBoard,
//   useLabels,
//   useUpdateCardLabel,
//   useUpdateLabelName,
// } from "../../../../../../../../../../hooks/useLabel";

const LabelList = ({ open, onClose, cardId, boardId }) => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();
  const { data: fetchedLabels } = useLabels(boardId);
  const { data: fetchedCardLabels } = useCardLabels(cardId);

  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateCardLabel();
  const deleteLabelMutation = useDeleteLabelByBoard();
  const updateLabelNameMutation = useUpdateLabelName();

  const [labels, setLabels] = useState([]);
  const [checkedLabels, setCheckedLabels] = useState(new Set());
  const [editLabelId, setEditLabelId] = useState(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newUpdatedLabelName, setUpdatedLabelName] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  // Cập nhật labels và checkedLabels khi dữ liệu thay đổi
  useEffect(() => {
    if (fetchedLabels) {
      setLabels(fetchedLabels);
    }
    if (fetchedCardLabels) {
      setCheckedLabels(new Set(fetchedCardLabels.map((label) => label.id)));
    }
  }, [fetchedLabels, fetchedCardLabels]);
  // console.log(labels);
  const handleCreateLabel = () => {
    if (!newLabelName.trim()) {
      alert("Tên nhãn không được để trống!");
      return;
    }
    setIsCreatingLabel(false);
    setNewLabelName("");
    setNewLabelColor("#000000");
    createLabelMutation.mutate(
      { boardId, data: { title: newLabelName, color: newLabelColor } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["labels", boardId] });

          queryClient.invalidateQueries({ queryKey: ["table-view"] });

        },
      }
    );
  };

  const handleUpdateLabelName = () => {
    if (!newUpdatedLabelName.trim()) {
      alert("Tên nhãn không được để trống!");
      return;
    }
    setIsEditingLabel(false);
    setEditLabelId(null);
    setUpdatedLabelName("");
    updateLabelNameMutation.mutate(
      { labelId: editLabelId, boardId, data: { title: newUpdatedLabelName } },
      {
        onSuccess: () => {
          setLabels((prevLabels) =>
            prevLabels.map((label) =>
              label.id === editLabelId
                ? { ...label, title: newUpdatedLabelName }
                : label
            )
          );
       
          queryClient.invalidateQueries({ queryKey: ["labels", boardId] });
          queryClient.invalidateQueries({ queryKey: ["table-view"] });

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
      updateLabelMutation.mutate(
        { cardId, labelId, action: updated.has(labelId) ? "add" : "remove" },
        {
          onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["labels", boardId] });
            queryClient.invalidateQueries({ queryKey: ["table-view"] });
          },
          onError: (error) => {
            console.error("❌ Lỗi mutation:", error);
          },
        }
      );
      return new Set(updated);
    });
  };

  const handleDeleteLabel = (labelId) => {
    deleteLabelMutation.mutate(
      { labelId, cardId, boardId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["labels", boardId] });
          queryClient.invalidateQueries({ queryKey: ["table-view"] });;
        },
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
                      width: "300px",
                      height: 24,
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
                }
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