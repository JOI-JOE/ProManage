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

const initialArchivedItems = [
  { id: 1, name: "Thẻ 1" },
  { id: 2, name: "Thẻ 2" },
  { id: 3, name: "nnnnn" },
  { id: 4, name: "New board" },
  { id: 5, name: "Test" },
  { id: 6, name: "Lưu trữ" },
];

const Archived = ({ open, onClose }) => {
  const [search, setSearch] = useState("");
  const [archivedItems, setArchivedItems] = useState(initialArchivedItems);

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
      <Box sx={{ width: 350, p: 2 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Mục đã lưu trữ</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Tìm kiếm lưu trữ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          InputProps={{
            style: { fontSize: "0.6rem" }, // Chữ nhập vào
            placeholder: "Tìm kiếm...",
            inputProps: { style: { fontSize: "12px" } }, // Placeholder
          }}
        />

        <Divider />

        {/* Danh sách thẻ lưu trữ */}
        <List>
          {filteredItems.map((item) => (
            <ListItem
              key={item.id}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <ListItemText primary={item.name} />
              <Button
                variant="contained"
                startIcon={<RestoreIcon />}
                onClick={() => handleRestore(item.id)}
                sx={{
                  mr: 1,
                  backgroundColor: "teal",
                  fontSize: "0.75rem",
                  padding: "4px 8px",
                }}
              >
                Hoàn trả
              </Button>
              <IconButton
                onClick={() => handleDelete(item.id)}
                sx={{ color: "red" }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

export default Archived;
