import React, { useState } from "react";
import {
  Popover,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Paper,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PrintIcon from "@mui/icons-material/Print";
import CodeIcon from "@mui/icons-material/Code";
import QrCodeIcon from "@mui/icons-material/QrCode";
import PeopleIcon from "@mui/icons-material/People";

const Print = ({ open, onClose, anchorEl }) => {
  const [link, setLink] = useState("https://trello.com/b/p8qmKVFR");
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [qrAnchorEl, setQrAnchorEl] = useState(null);

  // ✅ Hiển thị popover mã QR
  const handleOpenQR = (event) => {
    setQrAnchorEl(event.currentTarget);
    setShowQR(true);
  };

  // ✅ Đóng popover mã QR
  const handleCloseQR = () => {
    setShowQR(false);
    setQrAnchorEl(null);
  };

  // ✅ Xuất JSON và tải về máy
  const handleExportJSON = () => {
    const jsonData = { message: "Dữ liệu giả lập của Trello", link };
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  // ✅ Kích hoạt hộp thoại in
  const handlePrint = () => {
    window.print();
  };

  // ✅ Tải xuống ảnh QR
  const handleDownloadQR = () => {
    fetch(
      `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${link}`
    )
      .then((response) => response.blob())
      .then((blob) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(blob);
        downloadLink.download = "qrcode.png";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((error) => console.error("Lỗi tải ảnh QR:", error));
  };

  return (
    <>
      {/* ✅ Popover chính */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Paper sx={{ padding: 2, width: 300, position: "relative" }}>
          {/* ✅ Nút đóng */}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* ✅ Tiêu đề */}
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            In, xuất và chia sẻ
          </Typography>

          {/* ✅ Liên kết */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            Liên kết đến bảng thông tin này
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* ✅ Mô tả quyền xem */}
          <Typography
            variant="body2"
            color="gray"
            sx={{
              borderBottom: "1px solid #D3D3D3",
              pb: 1,
              display: "flex",
              alignItems: "center",
            }}
          >
            <PeopleIcon sx={{ fontSize: 18, mr: 1 }} />
            Tất cả các thành viên của Không gian làm việc có thể xem và sửa bảng
            này.
          </Typography>

          {/* ✅ Danh sách tùy chọn */}
          <List>
            <ListItem onClick={handlePrint} sx={{ cursor: "pointer" }}>
              <PrintIcon sx={{ mr: 1 }} />
              <ListItemText primary="In" />
            </ListItem>

            <ListItem onClick={handleExportJSON} sx={{ cursor: "pointer" }}>
              <CodeIcon sx={{ mr: 1 }} />
              <ListItemText primary="Xuất dạng JSON" />
            </ListItem>

            <ListItem onClick={handleOpenQR} sx={{ cursor: "pointer" }}>
              <QrCodeIcon sx={{ mr: 1 }} />
              <ListItemText primary="Hiển thị mã QR" />
            </ListItem>
          </List>
        </Paper>
      </Popover>

      {/* ✅ Popover hiển thị mã QR */}
      <Popover
        open={showQR}
        anchorEl={qrAnchorEl}
        onClose={handleCloseQR}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        <Paper
          sx={{
            padding: 2,
            width: 300,
            textAlign: "center",
            position: "relative",
          }}
        >
          {/* ✅ Nút đóng (X) ở góc trên cùng bên phải */}
          <IconButton
            onClick={handleCloseQR}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Typography variant="h6">Mã QR</Typography>
          <Typography variant="body2">
            Liên kết bất kỳ ai vào bảng này bằng cách quét mã QR:
          </Typography>

          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${link}`}
            alt="QR Code"
            style={{
              margin: "10px auto",
              display: "block",
              width: "100px",
              height: "100px",
            }}
          />

          {/* ✅ Nút tải xuống */}
          <Button
            variant="contained"
            color="primary"
            onClick={handleDownloadQR}
            sx={{ mt: 1 }}
          >
            Tải xuống
          </Button>
        </Paper>
      </Popover>

      {/* ✅ Thông báo xuất JSON */}
      <Snackbar
        open={showSnackbar}
        message="Đã tải xuống file JSON"
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        autoHideDuration={3000}
        onClose={() => setShowSnackbar(false)}
      />
    </>
  );
};

export default Print;
