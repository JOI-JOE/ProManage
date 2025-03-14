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


const MemberList = ({ open, onClose,}) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ textAlign: "center", fontSize: "17px", fontWeight: "bold" }}
      >
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
          {/* {members.map((member) => (
            <ListItem
              key={member.id}
              sx={{ display: "flex", alignItems: "center" }}
            >
              <Avatar sx={{ mr: 2 }}>{member.user_name.charAt(0)}</Avatar>
              <Typography>{member.user_name}</Typography>
            </ListItem>
          ))} */}
            <Typography>Chỗ này là thành viên của bảng, để lựa chọn để add và card</Typography>
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default MemberList;
