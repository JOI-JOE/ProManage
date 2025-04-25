import React, { useState, useEffect } from "react";
import { Box, TextField, Button, CircularProgress, Snackbar, Alert } from "@mui/material";
import { useUpdateInforWorkspace } from "../hooks/useWorkspace";

const WorkspaceInfo = ({ workspaceInfo, onCancel, refetchWorkspace }) => {
  // Khởi tạo dữ liệu form
  const initialFormData = {
    name: workspaceInfo ? workspaceInfo.display_name : "",
    description: workspaceInfo ? workspaceInfo.desc : "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isChanged, setIsChanged] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });
  const [nameError, setNameError] = useState("");

  // Sử dụng hook useUpdateInforWorkspace
  const updateWorkspace = useUpdateInforWorkspace();

  // Reset form khi workspaceInfo thay đổi
  useEffect(() => {
    if (workspaceInfo) {
      setFormData({
        name: workspaceInfo.display_name || "",
        description: workspaceInfo.desc || "",
      });
      setIsChanged(false);
      setNameError("");
    }
  }, [workspaceInfo]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Xóa lỗi tên khi người dùng thay đổi giá trị
    if (name === "name") {
      setNameError("");
    }

    // Kiểm tra xem dữ liệu có thay đổi so với ban đầu không
    setIsChanged(
      newFormData.name !== initialFormData.name ||
      newFormData.description !== initialFormData.description
    );
  };

  const handleUpdate = async () => {
    if (!formData.name.trim()) {
      setNameError("Tên không được để trống");
      return;
    }

    // Chỉ gửi dữ liệu đã thay đổi
    const updateData = {};
    if (formData.name.trim() !== initialFormData.name) {
      updateData.display_name = formData.name.trim();
    }
    if (formData.description?.trim() !== initialFormData.description) {
      updateData.desc = formData.description?.trim() || "";
    }

    // Chỉ gọi API nếu có dữ liệu thay đổi
    if (Object.keys(updateData).length > 0) {
      setIsUpdating(true);
      try {
        await updateWorkspace.mutateAsync(
          {
            id: workspaceInfo.id,
            data: updateData
          }
        );

        // Đảm bảo refetch hoàn thành trước khi đóng form
        await refetchWorkspace();

        setNotification({
          open: true,
          message: "Cập nhật thành công",
          severity: "success"
        });

        // Thêm độ trễ nhỏ để người dùng thấy được thông báo thành công
        setTimeout(() => {
          onCancel();
        }, 300);
      } catch (error) {
        console.error("Cập nhật thất bại:", error);

        // Xử lý lỗi tên đã tồn tại
        if (error.response?.data?.errors?.display_name) {
          const nameErrors = error.response.data.errors.display_name;
          if (nameErrors.includes("The display name has already been taken.")) {
            setNameError("Tên này đã được sử dụng");
          } else {
            setNameError(nameErrors[0]);
          }
        } else {
          setNotification({
            open: true,
            message: "Cập nhật thất bại: " + (error.response?.data?.message || "Đã xảy ra lỗi"),
            severity: "error"
          });
        }

        setIsUpdating(false);
      }
    } else {
      onCancel();
    }
  };

  // Để cập nhật nhanh khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && formData.name && !isUpdating) {
      if (!e.target.name || e.target.name === "name") {
        e.preventDefault();
        handleUpdate();
      }
    }
  };

  // Đóng thông báo
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box
      sx={{ width: "100%", maxWidth: "500px", padding: "16px" }}
      onKeyDown={handleKeyPress}
    >
      <TextField
        label="Tên *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        autoFocus
        disabled={isUpdating}
        error={!formData.name.trim() || Boolean(nameError)}
        helperText={nameError || (!formData.name.trim() ? "Tên không được để trống" : "")}
        sx={{
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputLabel-root": { color: "black" },
          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
        }}
      />
      <TextField
        label="Mô tả (tùy chọn)"
        name="description"
        value={formData.description || ""}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        disabled={isUpdating}
        sx={{
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputLabel-root": { color: "black" },
          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
        }}
      />

      <Box sx={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          size="medium"
          disabled={isUpdating}
        >
          Hủy
        </Button>

        <Button
          variant="contained"
          color="primary"
          disabled={!formData.name.trim() || !isChanged || isUpdating || Boolean(nameError)}
          onClick={handleUpdate}
          size="medium"
        >
          {isUpdating ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ marginRight: "8px" }} />
              Đang lưu...
            </>
          ) : (
            "Lưu"
          )}
        </Button>
      </Box>

      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WorkspaceInfo;