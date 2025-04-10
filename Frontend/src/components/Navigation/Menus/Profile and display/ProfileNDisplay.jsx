import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Slide,
  CircularProgress,
} from "@mui/material";
import { useUserById, useUpdateProfile } from "../../../../hooks/useUser";

function SlideTransition(props) {
  return <Slide {...props} direction="right" />;
}

const ProfileNDisplay = () => {

  const { data: user, isLoading: isUserLoading } = useUserById();

  const {
    mutate: updateProfile,
    isLoading: isUpdating,
    error,
    data,
  } = useUpdateProfile();

  // Form fields
  const [userName, setUserName] = useState("");
  const [biography, setBiography] = useState("");

  // Snackbar state
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState("success");

  // Set initial form values once user data is loaded
  useEffect(() => {
    if (user) {
      setUserName(user.user_name || "");
      setBiography(user.biography || "");
    }
  }, [user]);

  // Show snackbar on update result
  useEffect(() => {
    if (data) {
      setMessage("Cập nhật thành công!");
      setSeverity("success");
      setOpen(true);
    } else if (error) {
      setMessage("Có lỗi xảy ra khi cập nhật.");
      setSeverity("error");
      setOpen(true);
    }
  }, [data, error]);

  const handleClose = () => setOpen(false);

  const handleSave = () => {
    updateProfile({
      user_name: userName,
      biography,
    });
  };

  if (isUserLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={5}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: "#fff",
        padding: 3,
        borderRadius: 2,
        width: "100%",
        maxWidth: "450px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        margin: "auto",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#333",
          borderBottom: "2px solid #f0f0f0",
          paddingBottom: 1,
        }}
      >
        Quản lý thông tin cá nhân
      </Typography>

      <TextField
        fullWidth
        label="Tên người dùng"
        variant="outlined"
        size="small"
        value={userName}
        onChange={(e) => setUserName(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
          },
        }}
      />

      <Typography
        variant="body2"
        sx={{ mb: 1, color: "#555", fontWeight: 500 }}
      >
        Lý lịch
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={3}
        variant="outlined"
        size="small"
        value={biography}
        onChange={(e) => setBiography(e.target.value)}
        sx={{
          mb: 3,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
          },
        }}
      />

      <Button
        fullWidth
        variant="contained"
        disabled={isUpdating}
        onClick={handleSave}
        sx={{
          backgroundColor: "#2684FF",
          borderRadius: 1.5,
          padding: "10px 0",
          fontWeight: 500,
          "&:hover": { backgroundColor: "#0065ff" },
          "&:disabled": { backgroundColor: "#97b6e0" },
        }}
      >
        {isUpdating ? "Đang lưu..." : "Lưu"}
      </Button>

      <Snackbar
        open={open}
        autoHideDuration={2000}
        onClose={handleClose}
        TransitionComponent={SlideTransition}
        message={message}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: severity === "success" ? "#43a047" : "#d32f2f",
            color: "#fff",
            fontWeight: 500,
          },
        }}
      />
    </Box>
  );
};

export default ProfileNDisplay;
