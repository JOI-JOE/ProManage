import React, { useState } from "react";
import {
  Popover,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import WorkIcon from "@mui/icons-material/Work";
import PublicIcon from "@mui/icons-material/Public";
import DomainIcon from "@mui/icons-material/Domain";

const Copy = ({ open, onClose, anchorEl }) => {
  const [title, setTitle] = useState("");
  const [workspace, setWorkspace] = useState("j");
  const [keepCards, setKeepCards] = useState(true);
  const [keepTemplates, setKeepTemplates] = useState(true);
  const [showChangePopover, setShowChangePopover] = useState(false);
  const [visibility, setVisibility] = useState("workspace"); // Mặc định là không gian làm việc

  // Hàm chọn quyền hiển thị bảng
  const handleVisibilityChange = (type) => {
    setVisibility(type);
    setShowChangePopover(false);
  };

  return (
    <>
      {/* 🔹 Popover chính */}
      <Popover
        open={open && !showChangePopover}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div style={{ padding: "10px", width: "300px" }}>
          {/* ✅ Nút đóng Popover */}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* ✅ Tiêu đề */}
          <Typography variant="h6" sx={{ textAlign: "center", mb: 2 }}>
            Sao chép bảng thông tin
          </Typography>

          {/* ✅ Nhập tiêu đề */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tiêu đề
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Bạn đang tổ chức việc gì?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* ✅ Chọn không gian làm việc */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
              Không gian làm việc
            </Typography>
            <Select
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
            >
              <MenuItem value="j">j</MenuItem>
              <MenuItem value="k">k</MenuItem>
            </Select>
          </FormControl>

          {/* ✅ Mô tả vị trí bảng */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            {visibility === "private" ? (
              <>
                <LockIcon
                  color="error"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ ở chế độ <strong>Riêng tư.</strong>
              </>
            ) : visibility === "workspace" ? (
              <>
                <WorkIcon
                  color="warning"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ{" "}
                <strong>Hiển thị trong không gian làm việc.</strong>
              </>
            ) : (
              <>
                <PublicIcon
                  color="success"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ ở chế độ <strong>Công khai.</strong>
              </>
            )}
            <span
              style={{ color: "#2475E7", cursor: "pointer" }}
              onClick={() => setShowChangePopover(true)}
            >
              {" "}
              thay đổi.
            </span>
          </Typography>

          {/* ✅ Checkbox giữ thẻ và thẻ mẫu */}
          <FormControlLabel
            control={
              <Checkbox
                checked={keepCards}
                onChange={() => setKeepCards(!keepCards)}
              />
            }
            label="Giữ các thẻ"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={keepTemplates}
                onChange={() => setKeepTemplates(!keepTemplates)}
              />
            }
            label="Giữ các thẻ mẫu"
          />

          {/* ✅ Thông báo */}
          <Typography variant="body2" sx={{ color: "gray", mt: 1 }}>
            Hoạt động, nhận xét và các thành viên sẽ không được sao chép sang
            bảng thông tin mới.
          </Typography>

          {/* ✅ Nút Tạo mới */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!title.trim()}
          >
            Tạo mới
          </Button>
        </div>
      </Popover>

      {/* 🔹 Popover "Thay đổi không gian làm việc" */}
      <Popover
        open={showChangePopover}
        anchorEl={anchorEl}
        onClose={() => setShowChangePopover(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div style={{ padding: "10px", width: "300px" }}>
          {/* ✅ Nút quay lại */}
          <IconButton
            onClick={() => setShowChangePopover(false)}
            sx={{ position: "absolute", top: 8, left: 8 }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/* ✅ Nút đóng Popover */}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/* ✅ Tiêu đề */}
          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            Sao chép bảng thông tin
          </Typography>

          {/* ✅ Các tùy chọn */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("private")}
          >
            <LockIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Riêng tư</strong> - Chỉ thành viên bảng thông tin mới có
              quyền xem.
            </Typography>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("workspace")}
          >
            <WorkIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Không gian làm việc</strong> - Thành viên của Không gian
              làm việc có thể xem và sửa.
            </Typography>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("public")}
          >
            <PublicIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Công khai</strong> - Bất kỳ ai trên internet đều có thể
              xem bảng thông tin này.
            </Typography>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default Copy;
