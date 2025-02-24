import React, { useState, useEffect } from "react";
import { Box, TextField, Button } from "@mui/material";
import { useUpdateInforWorkspace } from "../../../hooks/useWorkspace";

const existingShortNames = ["abc", "xyz", "test"];

const WorkspaceDetailForm = ({ workspaceInfo, onCancel }) => {
  const initialFormData = {
    name: workspaceInfo ? workspaceInfo.name : "",
    shortName: workspaceInfo ? workspaceInfo.display_name : "",
    description: workspaceInfo ? workspaceInfo.desc : "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({ shortName: "" });

  // Sử dụng hook useUpdateInforWorkspace
  const updateWorkspace = useUpdateInforWorkspace();

  useEffect(() => {
    setFormData(initialFormData);
    setErrors({ shortName: "" });
  }, [workspaceInfo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "shortName") {
      let errorMessage = "";
      if (value.length < 3) {
        errorMessage = "Tên quá ngắn";
      } else if (existingShortNames.includes(value.toLowerCase())) {
        errorMessage = "Tên rút gọn đã tồn tại.";
      }
      setErrors((prev) => ({ ...prev, shortName: errorMessage }));
    }
  };

  const handleUpdate = () => {
    // Gọi API cập nhật thông tin workspace
    updateWorkspace.mutate(
      {
        id: workspaceInfo.id, // Sử dụng ID từ workspaceInfo
        data: {
          name: formData.name,
          display_name: formData.shortName,
          desc: formData.description,
        },
      },
      {
        onSuccess: () => {
          console.log("Cập nhật thành công!");
          onCancel(); // Đóng form sau khi cập nhật thành công
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
        sx={{
          "& .MuiInputBase-input": { color: "black" },
          "& .MuiInputLabel-root": { color: "black" },
          "& .MuiInputLabel-root.Mui-focused": { color: "black" },
        }}
      />
      <TextField
        label="Tên ngắn gọn *"
        name="shortName"
        value={formData.shortName}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
        error={!!errors.shortName}
        helperText={errors.shortName}
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
          disabled={
            !formData.name ||
            !formData.shortName ||
            !!errors.shortName ||
            updateWorkspace.isLoading
          }
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

export default WorkspaceDetailForm;