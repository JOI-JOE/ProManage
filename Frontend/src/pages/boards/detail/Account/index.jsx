import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Popover,
  Radio,
  RadioGroup,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  CircularProgress,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useParams } from "react-router-dom";
import { useGetWorkspaceById } from "../../../../hooks/useWorkspace";
import WorkspaceHeader from "../Member/Common/WorkspaceHeader";
import LogoLoading from "../../../../components/Common/LogoLoading";

const Account = () => {
  const { workspaceId } = useParams();

  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceById(workspaceId, {
    enabled: !!workspaceId,
  });

  const [isFormVisible, setFormVisible] = useState(false);
  const [visibility, setVisibility] = useState("public"); // Changed to "public" to match screenshot
  const [anchorEl, setAnchorEl] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);

  // Placeholder for admin status (adjust based on your auth logic)
  const isAdmin = workspace?.isCurrentUserAdmin || true; // Set to true for demo; replace with actual logic
  const allowInvite = false;

  const handleOpenInvite = () => {
    setInviteOpen(true);
    setLinkCopied(false);
    setIsLinkActive(false);
  };

  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
    setWorkspaceName("");
    handleCloseDeletePopover();
  };

  if (isLoadingWorkspace) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <LogoLoading />
      </Box>
    );
  }

  if (isWorkspaceError) {
    return (
      <Box sx={{ textAlign: "center", py: 2 }}>
        <Typography color="error">
          Error: {workspaceError?.message || "Failed to load workspace"}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: "100%",
        // maxWidth: "1200px",
        // padding: "20px",
        margin: "0 auto",
      }}
    >
      {/* Use WorkspaceHeader component */}
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={isAdmin}
        isFormVisible={isFormVisible}
        toggleFormVisibility={toggleFormVisibility}
        handleOpenInvite={handleOpenInvite}
        refetchWorkspace={refetchWorkspace}
        allowInvite={allowInvite}
      />
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
      <Paper
        sx={{
          // marginTop: "30px",
          padding: "24px",
          boxShadow: "none",
          // maxWidth: "900px",
          maxWidth: "1000px",
          margin: "30px auto",
          border: "1px solid #dfe1e6",
          borderRadius: "8px",
        }}
      >
        <Typography
          fontWeight="bold"
          sx={{ fontSize: 20, marginBottom: "20px", color: "#172b4d" }}
        >
          Cài đặt Không gian làm việc
        </Typography>

        {/* Khả năng hiển thị */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "24px",
            minHeight: "80px",
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <Typography fontWeight="bold" sx={{ fontSize: 16, color: "#172b4d" }}>
              Khả năng hiển thị trong Không gian làm việc
            </Typography>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
              {visibility === "private" ? (
                <LockIcon sx={{ fontSize: 16, color: "#eb5a47", mt: "2px" }} />
              ) : (
                <PublicIcon sx={{ fontSize: 16, color: "#2eb886", mt: "2px" }} />
              )}
              <Typography
                sx={{
                  fontSize: 14,
                  color: "#5e6c84",
                  lineHeight: "20px",
                }}
              >
                {visibility === "private" ? (
                  <>
                    Riêng tư – Đây là Không gian làm việc riêng tư. Chỉ những người trong Không gian làm việc có thể truy cập hoặc nhìn thấy Không gian làm việc.
                  </>
                ) : (
                  <>
                    Công khai – Đây là Không gian làm việc công khai. Bất kỳ ai có đường dẫn tới Không gian làm việc đều có thể nhìn thấy Không gian làm việc và Không gian làm việc có thể được tìm thấy trên các công cụ tìm kiếm như Google. Chỉ những người được mời vào Không gian làm việc mới có thể thêm và chỉnh sửa các bảng của Không gian làm việc.
                  </>
                )}
              </Typography>
            </Box>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={handleOpen}
            sx={{
              whiteSpace: "nowrap",
              color: "#172b4d",
              borderColor: "#dfe1e6",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              padding: "10px 25px",
              "&:hover": {
                borderColor: "#c1c7d0",
                backgroundColor: "#f4f5f7",
              },
            }}
          >
            Thay đổi
          </Button>
          <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
            disablePortal
            PaperProps={{
              sx: {
                mt: "50px",

                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                width: "320px",
              },
            }}
          >
            <Box sx={{ padding: "12px 16px" }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: "12px",
                }}
              >
                <Typography fontWeight="bold" sx={{ fontSize: 14, color: "#172b4d" }}>
                  Chọn khả năng hiển thị
                </Typography>
                <IconButton size="small" onClick={handleClose}>
                  <CloseIcon fontSize="small" sx={{ color: "#5e6c84" }} />
                </IconButton>
              </Box>

              <RadioGroup value={visibility} onChange={handleVisibilityChange}>
                <Box sx={{ width: "304px" }}>
                  <FormControlLabel
                    value="private"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <LockIcon sx={{ fontSize: 16, color: "#eb5a47" }} />
                          <Typography fontWeight="bold" sx={{ fontSize: 14, color: "#172b4d" }}>
                            Riêng tư
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ fontSize: 12, color: "#5e6c84", marginLeft: "24px", mt: "4px" }}
                        >
                          Đây là Không gian làm việc riêng tư. Chỉ những người trong Không gian làm việc có thể truy cập hoặc nhìn thấy Không gian làm việc.
                        </Typography>
                      </Box>
                    }
                    sx={{ mb: "12px" }}
                  />
                  <FormControlLabel
                    value="public"
                    control={<Radio size="small" />}
                    label={
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <PublicIcon sx={{ fontSize: 16, color: "#2eb886" }} />
                          <Typography fontWeight="bold" sx={{ fontSize: 14, color: "#172b4d" }}>
                            Công khai
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ fontSize: 10, color: "#5e6c84", marginLeft: "24px", mt: "4px" }}
                        >
                          Đây là Không gian làm việc công khai. Bất kỳ ai có đường dẫn tới Không gian làm việc đều có thể nhìn thấy Không gian làm việc và Không gian làm việc có thể được tìm thấy trên các công cụ tìm kiếm như Google. Chỉ những người được mời vào Không gian làm việc mới có thể thêm và chỉnh sửa các bảng của Không gian làm việc.
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              </RadioGroup>
            </Box>
          </Popover>
        </Box>

        <Button
          variant="outlined"
          color="error"
          onClick={handleDeleteClick}
          sx={{
            marginTop: "40px",
            alignItems: "center",
            textTransform: "none",
            fontWeight: 500,
            fontSize: "14px",
            color: "#eb5a47",
            borderColor: "#eb5a47",
            padding: "6px 12px",
            "&:hover": {
              backgroundColor: "#ffeef0",
              borderColor: "#eb5a47",
            },
          }}
        >
          Xóa Không gian làm việc này
        </Button>
      </Paper>

      <Popover
        open={Boolean(deleteAnchorEl)}
        anchorEl={deleteAnchorEl}
        onClose={handleCloseDeletePopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ padding: "16px" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: "12px",
            }}
          >
            <Typography fontWeight="bold" sx={{ fontSize: 14, color: "#172b4d" }}>
              Xóa Không gian làm việc này?
            </Typography>
            <IconButton size="small" onClick={handleCloseDeletePopover}>
              <CloseIcon fontSize="small" sx={{ color: "#5e6c84" }} />
            </IconButton>
          </Box>
          <Typography
            fontWeight="bold"
            sx={{ fontSize: 14, color: "#172b4d", mb: "12px" }}
          >
            Nhập tên Không gian làm việc "{workspace?.display_name || 'Tên Không Gian'}" để xóa
          </Typography>
          <Typography
            fontWeight="bold"
            sx={{ fontSize: 12, color: "#5e6c84", mb: "8px" }}
          >
            Những điều cần biết:
          </Typography>
          <List dense sx={{ fontSize: "12px", color: "#5e6c84", mb: "12px", padding: 0 }}>
            <ListItem sx={{ padding: "2px 0" }}>
              <ListItemIcon sx={{ minWidth: "20px" }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: "#5e6c84" }} />
              </ListItemIcon>
              <ListItemText primary="Điều này là vĩnh viễn và không thể hoàn tác." />
            </ListItem>
            <ListItem sx={{ padding: "2px 0" }}>
              <ListItemIcon sx={{ minWidth: "20px" }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: "#5e6c84" }} />
              </ListItemIcon>
              <ListItemText primary="Tất cả các bảng trong Không gian làm việc này sẽ bị đóng." />
            </ListItem>
            <ListItem sx={{ padding: "2px 0" }}>
              <ListItemIcon sx={{ minWidth: "20px" }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: "#5e6c84" }} />
              </ListItemIcon>
              <ListItemText primary="Các quản trị viên có thể mở lại các bảng." />
            </ListItem>
            <ListItem sx={{ padding: "2px 0" }}>
              <ListItemIcon sx={{ minWidth: "20px" }}>
                <FiberManualRecordIcon sx={{ fontSize: 8, color: "#5e6c84" }} />
              </ListItemIcon>
              <ListItemText primary="Các thành viên bảng sẽ không thể tương tác với các bảng đã đóng." />
            </ListItem>
          </List>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Nhập tên Không gian làm việc để xóa"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            sx={{
              mb: "12px",
              "& .MuiOutlinedInput-root": {
                borderRadius: "4px",
                "& fieldset": {
                  borderColor: "#dfe1e6",
                },
                "&:hover fieldset": {
                  borderColor: "#c1c7d0",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#0079bf",
                },
              },
              "& .MuiInputBase-input": {
                padding: "8px",
                fontSize: "14px",
                color: "#172b4d",
              },
            }}
            InputLabelProps={{
              sx: { color: "#5e6c84" },
              shrink: true,
            }}
          />
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}
          >
            <Button
              variant="contained"
              color="error"
              disabled={workspaceName !== (workspace?.display_name || "Tên Không Gian")}
              onClick={handleDeleteConfirm}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                backgroundColor: "#eb5a47",
                "&:hover": {
                  backgroundColor: "#d1453b",
                },
                "&:disabled": {
                  backgroundColor: "#f4f5f7",
                  color: "#a5adba",
                },
              }}
            >
              Xóa
            </Button>
            <Button
              variant="outlined"
              onClick={handleCloseDeletePopover}
              sx={{
                textTransform: "none",
                fontWeight: 500,
                fontSize: "14px",
                color: "#172b4d",
                borderColor: "#dfe1e6",
                "&:hover": {
                  backgroundColor: "#f4f5f7",
                  borderColor: "#c1c7d0",
                },
              }}
            >
              Hủy
            </Button>
          </Box>
        </Box>
      </Popover>
    </Box>
  );
};

export default Account;