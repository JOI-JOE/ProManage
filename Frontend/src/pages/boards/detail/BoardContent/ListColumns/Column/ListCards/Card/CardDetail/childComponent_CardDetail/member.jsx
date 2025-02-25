import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MemberList = ({ open, onClose, members }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredMembers = members.filter((member) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Thành viên
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Tìm kiếm các thành viên"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, fontSize: "0.7rem" }}
          InputProps={{
            style: { fontSize: "0.7rem" },
          }}
        />
        <List>
          {filteredMembers.map((member, index) => (
            <ListItem
              key={index}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Avatar sx={{ mr: 2 }}>{member.name.charAt(0)}</Avatar>
              <Typography>{member.name}</Typography>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default MemberList;
