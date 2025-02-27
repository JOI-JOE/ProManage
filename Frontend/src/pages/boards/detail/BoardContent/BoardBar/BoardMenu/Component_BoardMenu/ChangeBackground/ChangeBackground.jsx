import { useState, useRef } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import ImageList from "./ChildComponent_ChangeBackground/ImageList";
import ColorList from "./ChildComponent_ChangeBackground/ColorList"; // Import ColorList

const ChangeBackground = ({ open, onClose }) => {
  const [imageDrawerOpen, setImageDrawerOpen] = useState(false); // State điều khiển việc mở/đóng drawer cho danh sách ảnh
  const [colorDrawerOpen, setColorDrawerOpen] = useState(false); // State điều khiển việc mở/đóng drawer cho danh sách màu

  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected file:", file);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleImageDrawerToggle = () => {
    setImageDrawerOpen(!imageDrawerOpen); // Mở/đóng drawer danh sách ảnh
  };

  const handleColorDrawerToggle = () => {
    setColorDrawerOpen(!colorDrawerOpen); // Mở/đóng drawer danh sách màu
  };

  const handleSelectImage = (image) => {
    console.log("Chọn ảnh:", image);
    setImageDrawerOpen(false); // Đóng drawer khi chọn ảnh
    onClose(); // Đóng drawer của ChangeBackground nếu cần
  };

  const handleSelectColor = (color) => {
    console.log("Chọn màu:", color);
    setColorDrawerOpen(false); // Đóng drawer khi chọn màu
    onClose(); // Đóng drawer của ChangeBackground nếu cần
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: 300,
          backgroundColor: "#fff",
          color: "#000",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "16px",
        }}
      >
        <Typography variant="h6" sx={{ color: "#000" }}>
          Thay đổi hình nền
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "#000" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Nội dung */}
      <Box sx={{ padding: "16px" }}>
        {/* Tab chọn ảnh và màu */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                height: 110,
                backgroundColor: "#e0e0e0",
                color: "#000",
                backgroundImage:
                  "url('https://i.pinimg.com/474x/5a/23/2e/5a232ef72ccb9328abc2be3268429f2b.jpg')",
                backgroundSize: "cover",
              }}
              onClick={handleImageDrawerToggle} // Khi nhấn vào "Ảnh", mở drawer chứa danh sách ảnh
            >
              Ảnh
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                height: 110,
                backgroundColor: "#e0e0e0",
                color: "#000",
                backgroundImage:
                  "url('https://i.pinimg.com/474x/be/5a/d6/be5ad6b4821894240a9b63f3bb6a8093.jpg')",
                backgroundSize: "cover",
              }}
              onClick={handleColorDrawerToggle} // Khi nhấn vào "Màu", mở drawer chứa danh sách màu
            >
              Màu
            </Button>
          </Grid>
        </Grid>

        {/* Khu vực hiển thị ảnh nền */}
        <Box
          sx={{ marginTop: "16px", backgroundColor: "#f0f0f0", height: 100 }}
          onClick={handleClick}
        >
          <Typography
            variant="body2"
            sx={{
              height: "110px",
              color: "#000",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Tuỳ chọn
            <AddIcon
              sx={{
                display: "block",
                alignItems: "center",
                margin: "auto",
              }}
            />
          </Typography>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
        </Box>
      </Box>

      {/* Drawer cho danh sách ảnh */}
      <Drawer
        anchor="right"
        open={imageDrawerOpen}
        onClose={handleImageDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 300,
            backgroundColor: "#fff",
            color: "#000",
          },
        }}
      >
        <Box sx={{ padding: "16px" }}>
          <Typography variant="h6" sx={{ color: "#000", marginBottom: "16px" }}>
            Chọn ảnh nền
          </Typography>

          <ImageList onSelectImage={handleSelectImage} />
        </Box>
      </Drawer>

      {/* Drawer cho danh sách màu */}
      <Drawer
        anchor="right"
        open={colorDrawerOpen}
        onClose={handleColorDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: 300,
            backgroundColor: "#fff",
            color: "#000",
          },
        }}
      >
        <Box sx={{ padding: "16px" }}>
          <Typography variant="h6" sx={{ color: "#000", marginBottom: "16px" }}>
            Chọn màu nền
          </Typography>

          <ColorList onSelectColor={handleSelectColor} />
        </Box>
      </Drawer>
    </Drawer>
  );
};

export default ChangeBackground;
