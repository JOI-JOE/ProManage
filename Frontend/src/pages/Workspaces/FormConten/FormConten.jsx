import React, { useState } from "react";
import { Box, TextField, Button } from "@mui/material";
import { Link } from "react-router-dom";

const FormConten = () => {
  const [formData, setFormData] = useState({
    name: "",
    shortName: "",
    description: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Box
      sx={{
        width: "50%",
        padding: "10px",
      }}
    >
      <TextField
        label="Tên *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
      />
      <TextField
        label="Tên ngắn gọn *"
        name="shortName"
        value={formData.shortName}
        onChange={handleChange}
        fullWidth
        margin="normal"
        required
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
      />

      <Box sx={{ display: "flex", gap: "10px", marginTop: "20px" }}>
        <Button
          variant="contained"
          color="primary"
          disabled={!formData.name || !formData.shortName}
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
export default FormConten;
