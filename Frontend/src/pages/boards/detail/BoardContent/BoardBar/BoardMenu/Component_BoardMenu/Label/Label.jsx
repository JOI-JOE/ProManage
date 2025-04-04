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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import {
  // useLabels,
  useCreateLabel,
  useDeleteLabelByBoard,
  useUpdateCardLabel,
  useUpdateLabelName
} from "../../../../../../../../hooks/useLabel";
import { useParams } from "react-router-dom";
// const initialLabels = [
//   { id: 1, color: "#137b13", name: "Label 1" },
//   { id: 2, color: "#b05900", name: "Label 2" },
//   { id: 3, color: "#d32f2f", name: "Label 3" },
//   { id: 4, color: "#673ab7", name: "Label 4" },
//   { id: 5, color: "#1976d2", name: "Label 5" },
// ];

const LabelList = ({ open, onClose, selectedLabels, onSelectLabel }) => {
  const { boardId } = useParams();

  // const { data: fetchedLabels } = useLabels(boardId);
  // Cập nhật labels khi fetchedLabels thay đổi
  const createLabelMutation = useCreateLabel();
  const updateLabelMutation = useUpdateCardLabel();
  const deleteLabelMutation = useDeleteLabelByBoard();
  const updateLabelNameMutation = useUpdateLabelName(); //
  const [labels, setLabels] = useState([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [editLabelId, setEditLabelId] = useState("");
  const [NewUpdatedLabelName, setUpdatedLabelName] = useState("");
  const [search, setSearch] = useState("");
  const [isCreatingLabel, setIsCreatingLabel] = useState(false);
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [newLabelColor, setNewLabelColor] = useState("#000000");

  // useEffect(() => {
  //   if (fetchedLabels) setLabels(fetchedLabels);

  // }, [fetchedLabels]);
  // const handleCreateLabel = () => {
  //   if (!newLabelName.trim()) {
  //     alert("Tên nhãn không được để trống!");
  //     return;
  //   }
  //   createLabelMutation.mutate(
  //     { boardId, data: { title: newLabelName, color: newLabelColor } },
  //     {
  //       onSuccess: () => {
  //         setIsCreatingLabel(false);
  //         setNewLabelName("");
  //         setNewLabelColor("#000000");
  //       },
  //     }
  //   );
  // };
  // sửa tên

  const handleUpdateLabelName = () => {
    if (!NewUpdatedLabelName.trim()) alert("Tên nhãn không được để trống!");

    updateLabelNameMutation.mutate(
      { labelId: editLabelId, data: { title: NewUpdatedLabelName } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["labels"] });
          // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] });
          // queryClient.invalidateQueries({ queryKey: ["lists"] });
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
        onSuccess: () => {
          // queryClient.invalidateQueries({ queryKey: ["labels"] });
          // queryClient.invalidateQueries({ queryKey: ["cardLabels", cardId] });
        },
      }
    );
    // fetchedLabels();
  };
  const filteredLabels = labels.filter((label) =>
    label.title.toLowerCase().includes(search.toLowerCase())
  );
  // console.log(filteredLabels);
  const handleEditLabel = (id, title) => {
    setEditLabelId(id);
    setIsEditingLabel(true);
    setUpdatedLabelName("");
  };


  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Ngăn chặn reload
      handleUpdateLabelName(); // Cập nhật tên nhãn
      setIsEditingLabel(false); // Thoát chế độ chỉnh sửa
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

        {/* Danh sách nhãn */}
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
              marginBottom: "12px", // Add spacing between labels
            },
          }}
        >
          {filteredLabels.map((label) => (
            <ListItem key={label.id} disablePadding>
              <Box
                sx={{
                  width: "300px", // Thanh màu dài ra
                  height: 24,
                  backgroundColor: label?.color?.hex_code,
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
                ) : (
                  <>
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
                  <CloseIcon sx={{ fontSize: 12, color: "#000" }} />
                </IconButton>
              </Box>
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
