import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";

const existingShortNames = ["abc", "xyz", "test"];

const WorkspaceDetailForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  });

  const [errors, setErrors] = useState({
    shortName: "",
  });

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
          disabled={!formData.name || !formData.shortName || !!errors.shortName}
        >
          Lưu
        </Button>
        <Button variant="outlined" onClick={() => window.location.reload()}>
          Hủy
        </Button>
      </Box>
    </Box>
  );
};

export default WorkspaceDetailForm;
