import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useUpdateInforWorkspace } from "../hooks/useWorkspace";

const WorkspaceInfo = ({ workspaceInfo, onCancel, refetchWorkspace }) => {
  // Khởi tạo dữ liệu form
  const initialFormData = {
    name: workspaceInfo ? workspaceInfo.display_name : "",
    description: workspaceInfo ? workspaceInfo.desc : "",
  };

  const [formData, setFormData] = useState(initialFormData);

  // Sử dụng hook useUpdateInforWorkspace
  const updateWorkspace = useUpdateInforWorkspace();

  // Reset form khi workspaceInfo thay đổi
  useEffect(() => {
    setFormData(initialFormData);
  }, [workspaceInfo]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Xử lý cập nhật workspace
  const handleUpdate = async () => {
    await updateWorkspace.mutate(
      {
        id: workspaceInfo.id,
        data: {
          display_name: formData.name,
          desc: formData.description,
        },
      },
      {
        onSuccess: () => {
          refetchWorkspace()
          console.log("Cập nhật thành công!");
          onCancel(); // Đóng form sau khi cập nhật
        },
        onError: (error) => {
          console.error("Cập nhật thất bại:", error);
        },
      }
    );
  };

  return (
    <Box sx={{ width: "50%", padding: "10px" }}>
      <TextField
        label="Tên *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        error={!formData.name} // Hiển thị lỗi nếu tên trống
        helperText={!formData.name ? "Tên không được để trống" : ""}
        sx={{
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputLabel-root": { color: "black" },
          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
        }}
      />
      <TextField
        label="Mô tả (tùy chọn)"
        name="description"
        value={formData.description}
        onChange={handleChange}
        fullWidth
        multiline
        rows={3}
        margin="normal"
        sx={{
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputLabel-root": { color: "black" },
          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
        }}
      />

      <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!formData.name || updateWorkspace.isLoading}
          onClick={handleUpdate}
        >
          {updateWorkspace.isLoading ? "Đang cập nhật..." : "Lưu"}
        </Button>

        <Button variant="outlined" onClick={onCancel}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
};

export default WorkspaceInfo;