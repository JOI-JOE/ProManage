import React, { useState, useRef } from "react";
import {
  Popover,
  Typography,
  TextField,
  Button,
  Link,
  Select,
  MenuItem,
  FormControl,
  Grid,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Email = ({ open, onClose, anchorEl }) => {
  const [email, setEmail] = useState("trangnguyenthu41+0xepsks");
  const [list, setList] = useState("Đang làm");
  const [position, setPosition] = useState("Dưới cùng");
  const [openResetPopover, setOpenResetPopover] = useState(false);
  const emailInputRef = useRef(null);
  const resetEmailRef = useRef(null);

  // Sao chép email vào clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(email);
    toast.success("Đã sao chép email!", { position: "bottom-left" });
  };

  //  Hiển thị thông báo khi bấm "Gửi email cho tôi địa chỉ này"
  const handleSendEmail = () => {
    toast.success("Đã gửi", { position: "bottom-left" });
  };

  const handleResetEmail = () => {
    setOpenResetPopover(true);
  };

  //  Tạo email mới
  const handleCreateNewEmail = () => {
    setOpenResetPopover(false);
    setEmail("trangnguyenthu41+moi123");
    setTimeout(() => {
      if (emailInputRef.current) {
        emailInputRef.current.focus();
        emailInputRef.current.select();
      }
    }, 100);
  };

  return (
    <>
      {/* Container hiển thị thông báo */}
      <ToastContainer autoClose={2000} />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div style={{ padding: "10px", width: "300px" }}>
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            Thêm thẻ qua email
          </Typography>
          <Typography variant="body2" color="black" sx={{ fontWeight: "bold" }}>
            Địa chỉ email dành cho bảng thông tin này
          </Typography>

          <Grid container spacing={1} alignItems="center" sx={{ mt: 1 }}>
            <Grid item xs={9}>
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                value={email}
                inputRef={emailInputRef}
                InputProps={{ readOnly: true }}
              />
            </Grid>
            <Grid item xs={3}>
              <Button variant="contained" onClick={handleCopy} fullWidth>
                <ContentCopyIcon fontSize="small" />
              </Button>
            </Grid>
          </Grid>
          <Typography variant="body2" color="gray" sx={{ fontSize: "10px" }}>
            Bất kỳ ai có email này đều có thể thêm thẻ như bạn.
          </Typography>

          {/*  Liên kết đặt lại email */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            <Link
              href="#"
              underline="hover"
              sx={{ color: "#2475E7" }}
              ref={resetEmailRef}
              onClick={handleResetEmail}
            >
              Đặt lại địa chỉ email
            </Link>
          </Typography>
          <Typography
            variant="body2"
            sx={{ borderBottom: "1px solid #D3D3D3" }}
          >
            <Link
              href="#"
              underline="hover"
              sx={{ color: "#2475E7" }}
              onClick={handleSendEmail}
            >
              Gửi email cho tôi địa chỉ này
            </Link>
          </Typography>

          {/*  Dropdown chọn danh sách & vị trí */}
          <Typography variant="body2" sx={{ mt: 2 }}>
            Những thẻ bạn đã gửi email sẽ xuất hiện trong ...
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Danh sách
              </Typography>
              <FormControl fullWidth>
                <Select value={list} onChange={(e) => setList(e.target.value)}>
                  <MenuItem value="Đang làm">Đang làm</MenuItem>
                  <MenuItem value="Cần làm">Cần làm</MenuItem>
                  <MenuItem value="Xong">Xong</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Vị trí
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                >
                  <MenuItem value="Trên cùng">Trên cùng</MenuItem>
                  <MenuItem value="Dưới cùng">Dưới cùng</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </div>
      </Popover>

      <Popover
        open={openResetPopover}
        anchorEl={resetEmailRef.current}
        onClose={() => setOpenResetPopover(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <div style={{ padding: "16px", width: "260px" }}>
          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            Tạo địa chỉ email mới?
          </Typography>
          <Typography variant="body2">
            Địa chỉ email cũ sẽ không thể sử dụng tiếp và sẽ không có cách nào
            để hoàn tác. Bạn muốn tiếp tục?
          </Typography>
          <Button
            variant="contained"
            fullWidth
            sx={{ backgroundColor: "#AE2E24", color: "white", mt: 2 }}
            onClick={handleCreateNewEmail}
          >
            Tạo địa chỉ email mới
          </Button>
        </div>
      </Popover>
    </>
  );
};

export default Email;
