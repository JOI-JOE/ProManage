import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Grid,
} from "@mui/material";

const CopyCardModal = ({ open, onClose }) => {
  const [cardName, setCardName] = useState("");
  const [keepChecklist, setKeepChecklist] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  const boards = ["Thất tịch", "Bảng 2", "Bảng 3"];
  const lists = ["mmm", "Danh sách 2", "Danh sách 3"];
  const positions = [1, 2, 3, 4];

  const handleCopy = () => {
    console.log("Copying card:", {
      name: cardName,
      keepChecklist,
      selectedBoard,
      selectedList,
      selectedPosition,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle
        sx={{ textAlign: "center", fontSize: "17px", fontWeight: "bold" }}
      >
        Sao chép thẻ
      </DialogTitle>
      <DialogContent>
        <TextField
          placeholder="Nhập tên thẻ"
          fullWidth
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          margin="dense"
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "30px",
              fontSize: "0.8rem",
            },
            "& input::placeholder": {
              fontSize: "0.6rem",
            },
            "& .MuiInputLabel-root": {
              display: "none",
            },
          }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={keepChecklist}
              onChange={(e) => setKeepChecklist(e.target.checked)}
            />
          }
          label="Danh sách công việc (1)"
          sx={{ fontSize: "0.7rem" }}
        />

        <FormControl fullWidth margin="dense">
          <Select
            displayEmpty
            value={selectedBoard}
            onChange={(e) => setSelectedBoard(e.target.value)}
            sx={{
              height: "30px",
              fontSize: "0.8rem",
              "& .MuiSelect-select": {
                fontSize: "0.6rem",
              },
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  "& .MuiMenuItem-root": {
                    fontSize: "0.7rem",
                  },
                },
              },
            }}
          >
            <MenuItem value="" disabled>
              Chọn bảng thông tin
            </MenuItem>
            {boards.map((board, index) => (
              <MenuItem key={index} value={board}>
                {board}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <Select
                displayEmpty
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                sx={{
                  height: "30px",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": {
                    fontSize: "0.6rem",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        fontSize: "0.7rem",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Chọn danh sách
                </MenuItem>
                {lists.map((list, index) => (
                  <MenuItem key={index} value={list}>
                    {list}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth margin="dense">
              <Select
                displayEmpty
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                sx={{
                  height: "30px",
                  fontSize: "0.8rem",
                  "& .MuiSelect-select": {
                    fontSize: "0.6rem",
                  },
                }}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      "& .MuiMenuItem-root": {
                        fontSize: "0.7rem",
                      },
                    },
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Chọn vị trí
                </MenuItem>
                {positions.map((position, index) => (
                  <MenuItem key={index} value={position}>
                    {position}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={handleCopy} variant="contained">
          Tạo thẻ
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyCardModal;
