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

  const { mutate: updateProfile, isLoading: isUpdating } = useUpdateProfile();

  const [userName, setUserName] = useState("");
  const [biography, setBiography] = useState("");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    if (user) {
      setUserName(user.full_name || "");
      setBiography(user.biography || "");
    }
  }, [user]);

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  const handleSave = () => {
    if (!userName.trim()) {
      setSnackbar({
        open: true,
        message: "Tên người dùng không được để trống.",
        severity: "error",
      });
      return;
    }

    updateProfile(
      { full_name: userName.trim(), biography: biography.trim() },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: "Cập nhật thành công!",
            severity: "success",
          });
        },
        onError: () => {
          setSnackbar({
            open: true,
            message: "Cập nhật thất bại.",
            severity: "error",
          });
        },
      }
    );
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
        maxWidth: "650px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        margin: "auto",
        marginTop: "20px",
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

      <Typography
        variant="body2"
        sx={{ mb: 1, color: "#555", fontWeight: 500 }}
      >
        Tên người dùng
      </Typography>
      <TextField
        fullWidth
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
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        TransitionComponent={SlideTransition}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor:
              snackbar.severity === "success" ? "#43a047" : "#d32f2f",
            color: "#fff",
            fontWeight: 500,
          },
        }}
      />
    </Box>
  );
};

export default ProfileNDisplay;
