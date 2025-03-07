import { useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  IconButton,
  Popover,
  Radio,
  RadioGroup,
  FormControlLabel,
  List,
  ListItem,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WorkspaceDetailForm from "../../../workspace/home/WorkspaceDetailForm";

const Board = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [visibility, setVisibility] = useState("private"); // Mặc định là riêng tư
  const [anchorEl, setAnchorEl] = useState(null);
  const [setDeleteConfirmOpen] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const handleOpenInvite = () => {
    setInviteOpen(true);
    setLinkCopied(false);
    setIsLinkActive(false);
  };

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const workspace = {
    name: "Tên Không Gian",
  };

  // Mở Popover khi bấm "Thay đổi"
  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Đóng Popover
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Chỉ thay đổi trạng thái, KHÔNG đóng Popover
  const handleVisibilityChange = (event) => {
    setVisibility(event.target.value);
  };

  const handleCopyLink = () => {
    setLinkCopied(true);
    setIsLinkActive(true);
    setShowCopiedMessage(true);
    navigator.clipboard.writeText("https://example.com/invite-link");
    setTimeout(() => setShowCopiedMessage(false), 3000);
  };

  const handleDisableLink = () => {
    setIsLinkActive(false);
    setLinkCopied(false);
  };
  const handleCloseInvite = () => {
    setInviteOpen(false);
  };

  const handleDeleteClick = (event) => {
    setDeleteAnchorEl(event.currentTarget);
  };
  const handleCloseDeletePopover = () => {
    setDeleteAnchorEl(null);
    setWorkspaceName("");
  };
  const handleDeleteConfirm = () => {
    console.log("Không gian làm việc đã bị xóa!");
    setDeleteConfirmOpen(false);
    setWorkspaceName("");
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        padding: "20px",
        margin: "30px auto",
      }}
    >
      {/* Header chứa Tiêu đề và Nút Mời Thành Viên */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #D3D3D3",
          paddingBottom: "40px",
          width: "100%",
          maxWidth: "1100px",
          margin: "0 auto",
          minHeight: "80px",
        }}
      >
        {/* Nếu form chưa hiển thị, hiển thị avatar và tiêu đề */}
        {!isFormVisible ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar
              sx={{
                bgcolor: "#5D87FF",
                width: "80px",
                height: "80px",
                marginLeft: "100px",
              }}
            >
              <span style={{ fontSize: "30px", fontWeight: "bold" }}>
                {workspace.name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography fontWeight="bold" sx={{ fontSize: 25 }}>
                  {workspace.name}
                </Typography>
                <IconButton
                  onClick={toggleFormVisibility}
                  sx={{
                    color: "gray",
                    "&:hover": { backgroundColor: "transparent" },
                  }}
                >
                  <EditIcon sx={{ fontSize: 24 }} />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  color: "gray",
                }}
              >
                <LockIcon sx={{ fontSize: 14 }} />
                <Typography sx={{ fontSize: 14 }}>Riêng tư</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <WorkspaceDetailForm />
        )}

        <Button
          variant="contained"
          sx={{
            bgcolor: "#026AA7",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "8px 12px",
            boxShadow: "none",
            marginRight: "60px",
            "&:hover": { bgcolor: "#005A96" },
          }}
          onClick={handleOpenInvite}
        >
          Mời các thành viên Không gian làm việc
        </Button>
      </Box>

      {/* Modal Mời Thành Viên */}
      <Dialog
        open={isInviteOpen}
        onClose={handleCloseInvite}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "20px" }}>
          Mời vào Không gian làm việc
          <IconButton
            sx={{ position: "absolute", right: 8, top: 8 }}
            onClick={handleCloseInvite}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Địa chỉ email hoặc tên"
            sx={{ marginBottom: "10px" }}
          />
          <Stack direction="column" spacing={1} sx={{ mt: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 1,
                bgcolor: linkCopied ? "#E6F4EA" : "transparent",
                borderRadius: 1,
              }}
            >
              {showCopiedMessage ? (
                <Stack direction="row" alignItems="center" spacing={1}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="body2" color="success.main">
                    Liên kết đã sao chép vào khay nhớ tạm
                  </Typography>
                </Stack>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  Mời ai đó vào Không gian làm việc này bằng liên kết:
                </Typography>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={handleCopyLink}
              >
                {linkCopied ? "Đã sao chép" : "Tạo liên kết"}
              </Button>
            </Stack>
            {isLinkActive && (
              <Typography
                variant="body2"
                color="primary"
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  textAlign: "right",
                }}
                onClick={handleDisableLink}
              >
                Tắt liên kết
              </Typography>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Nội dung */}
    </Box>
  );
};
export default Board;
