import { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkspaceById, useUpdateWorkspacePermission } from "../../../../hooks/useWorkspace";
import WorkspaceHeader from "../Member/Common/WorkspaceHeader";
import LogoLoading from "../../../../components/Common/LogoLoading";
import { useMe } from "../../../../contexts/MeContext";

const Account = () => {
  const { workspaceId } = useParams();
  const { workspaceIds, userLoading } = useMe();
  const [isAllowed, setIsAllowed] = useState(false);
  const [checked, setChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Chỉ check khi user đã load xong
    if (userLoading || !workspaceIds || !workspaceId) return;

    const isExist = workspaceIds.some(ws => ws.id === workspaceId);

    if (isExist) {
      setIsAllowed(true);
    } else {
      navigate(`/w/${workspaceId}`);
    }

    setChecked(true);
  }, [workspaceId, workspaceIds, userLoading, navigate]);


  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isError: isWorkspaceError,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceById(workspaceId, {
    enabled: !!workspaceId && isAllowed,
  });


  const [isFormVisible, setFormVisible] = useState(false);
  const [visibility, setVisibility] = useState(workspace?.permission_level || "public");
  const [anchorEl, setAnchorEl] = useState(null);
  const [workspaceName, setWorkspaceName] = useState("");
  const [deleteAnchorEl, setDeleteAnchorEl] = useState(null);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [alert, setAlert] = useState({ open: false, message: "", severity: "success" });

  const isAdmin = workspace?.isCurrentUserAdmin || false; // Adjust based on actual logic
  const allowInvite = false;

  const { mutate: updatePermission, isLoading: isUpdatingPermission } = useUpdateWorkspacePermission();

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
    const newVisibility = event.target.value;
    setVisibility(newVisibility);

    if (isAdmin) {
      updatePermission(
        { workspaceId, permissionLevel: newVisibility },
        {
          onSuccess: () => {
            setAlert({
              open: true,
              message: "Cập nhật quyền truy cập Không gian làm việc thành công.",
              severity: "success",
            });
            refetchWorkspace();
            handleClose();
          },
          onError: (error) => {
            setAlert({
              open: true,
              message: error.response?.data?.message || "Đã xảy ra lỗi khi cập nhật quyền truy cập.",
              severity: "error",
            });
            setVisibility(workspace?.permission_level || "public");
          },
        }
      );
    } else {
      setAlert({
        open: true,
        message: "Bạn không có quyền cập nhật quyền truy cập của Không gian làm việc này.",
        severity: "error",
      });
      setVisibility(workspace?.permission_level || "public");
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
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

  if (userLoading || !checked || isLoadingWorkspace) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <LogoLoading />
      </Box>
    );
  }

  if (!isAllowed) return null;

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
        margin: "0 auto",
      }}
    >
      {/* Snackbar for alerts */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>

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

      {/* Nội dung */}
      <Paper
        sx={{
          padding: "24px",
          boxShadow: "none",
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
            disabled={isUpdatingPermission || !isAdmin}
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
              "&:disabled": {
                backgroundColor: "#f4f5f7",
                color: "#a5adba",
              },
            }}
          >
            {isUpdatingPermission ? <CircularProgress size={20} /> : "Thay đổi"}
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
                          sx={{ fontSize: 12, color: "#5e6c84", marginLeft: "24px", mt: "4px" }}
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