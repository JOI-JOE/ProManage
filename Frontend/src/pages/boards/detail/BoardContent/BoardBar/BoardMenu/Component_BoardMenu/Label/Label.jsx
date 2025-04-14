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
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import { useCreateLabel, useDeleteLabelByBoard, useLabels, useUpdateCardLabel, useUpdateLabelName } from "../../../../../../../../hooks/useLabel";
import { useParams } from "react-router-dom";

const LabelList = ({ open, onClose, selectedLabels, onSelectLabel }) => {
  const { boardId } = useParams();
  
  const { data: fetchedLabels } = useLabels(boardId);
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateCardLabel();
  const deleteLabelMutation = useDeleteLabelByBoard();
  const updateLabelNameMutation = useUpdateLabelName();
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [editLabelId, setEditLabelId] = useState("");
  const [NewUpdatedLabelName, setUpdatedLabelName] = useState("");
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
    if (!NewUpdatedLabelName.trim()) alert("Tên nhãn không được để trống!");
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
    setUpdatedLabelName("");
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
          fontSize: "1rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          // Removed the dark background to revert to default
        }}
      >
        Nhãn
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          // Removed the dark background to revert to default
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
        {/* Full-width search field */}
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Tìm nhãn..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            mb: 2,
            "& .MuiInputBase-root": {
              height: 30,
            },
          }}
        />

        {/* List of labels with larger, longer color bars and smaller spacing */}
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
            "& .MuiListItem-root": {
              marginBottom: "4px", // Reduced spacing between labels
            },
          }}
        >
          {filteredLabels.map((label) => (
            <ListItem key={label.id} disablePadding>
              <Box
                sx={{
                  width: "100%", // Full width for the color bar
                  height: 32, // Taller color bar
                  backgroundColor: label?.color?.hex_code,
                  borderRadius: "4px",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 8px",
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
                    fullWidth // Full width for the edit field
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          border: "none",
                        },
                      },
                    }}
                  />
                ) : (
                  <>
                    {/* Label name at the start of the color bar */}
                    <Typography
                      sx={{
                        fontSize: "1rem", // Larger font size for the label name
                        fontWeight: "bold",
                        color: "#fff", // White text for contrast on colored background
                        marginRight: "auto", // Push the text to the left
                      }}
                    >
                      {label.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => {
                        handleEditLabel(label.id, label.title);
                      }}
                      sx={{ width: 24, height: 24 }}
                    >
                      <EditIcon sx={{ fontSize: 12, color: "#fff" }} />
                    </IconButton>
                  </>
                )}
              </Box>
              <Box sx={{ display: "flex", gap: 1, marginLeft: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => handleDeleteLabel(label.id)}
                  sx={{ width: 24, height: 24 }}
                >
                  <CloseIcon sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2 }} />

        {/* Form to create a new label */}
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
              sx={{
                backgroundColor: "#2196f3", // Blue button color to match the screenshot
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#1976d2", // Slightly darker on hover
                },
              }}
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
            sx={{
              backgroundColor: "#2196f3", // Blue button color to match the screenshot
              color: "#fff",
              "&:hover": {
                backgroundColor: "#1976d2", // Slightly darker on hover
              },
            }}
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