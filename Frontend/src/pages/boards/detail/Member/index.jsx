import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Button,
  Chip,
  Paper,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useParams } from "react-router-dom";

import WorkspaceDetailForm from "../../../workspace/home/WorkspaceDetailForm";
import MemberItem from "./MemberItem";
import { useGetWorkspaceByName } from "../../../../hooks/useWorkspace";

const Member = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const handleOpenInvite = () => {
    setInviteOpen(true);
    setLinkCopied(false);
    setIsLinkActive(false);
  };

  const { workspaceName } = useParams();

  const {
    data: workspace,
    isLoading: workspaceLoadingByName,
    error: workspaceErrorByName,
  } = useGetWorkspaceByName(workspaceName, {
    enabled: !!workspaceName, // Chỉ fetch nếu không có workspaceId
  });


  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleCloseInvite = () => {
    setInviteOpen(false);
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

  const members = workspace.members

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px", // ✅ Giới hạn chiều rộng tối đa
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
          width: "100%", // ✅ Để 100% thay vì 75vw
          maxWidth: "1100px", // ✅ Giới hạn kích thước
          margin: "0 auto", // ✅ Đưa về giữa thay vì -60px
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
                {workspace?.display_name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Typography fontWeight="bold" sx={{ fontSize: 25 }}>
                  {workspace?.display_name}
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

        {/* Nút Mời Thành Viên luôn nằm bên phải, giữ cùng hàng với tiêu đề */}
        <Button
          variant="contained"
          sx={{
            bgcolor: "#026AA7",
            textTransform: "none",
            fontSize: "14px",
            fontWeight: "bold",
            padding: "8px 12px",
            boxShadow: "none",
            marginRight: "60px", // ✅ Đẩy nút về bên phải tự nhiên
            "&:hover": { bgcolor: "#005A96" },
          }}
          onClick={handleOpenInvite}
        >
          Mời các thành viên Không gian làm việc
        </Button>
      </Box>

      {/* Nội dung */}
      <Grid
        container
        spacing={2}
        sx={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}
      >
        {/* Cột trái: Người cộng tác - Chỉ chiếm 20% */}
        <Grid
          item
          xs={12}
          sm={3}
          md={2}
        // sx={{ borderRight: "1px solid #D3D3D3" }}
        >
          <Box sx={{ padding: "0px", width: "100%" }}>
            <Typography variant="h6" fontWeight="bold">
              Người cộng tác
            </Typography>
            <Chip
              label="1 / 10"
              size="small"
              sx={{ fontSize: "12px", backgroundColor: "#F4F5F7" }}
            />

            <Paper
              elevation={0}
              sx={{
                backgroundColor: "#E8F0FE",
                padding: 1,
                borderRadius: 2,
                mt: 2,
              }}
            >
              <Typography variant="body2" color="primary" fontWeight="bold">
                Thành viên không gian làm việc (1)
              </Typography>
            </Paper>

            <List sx={{ padding: 0, marginTop: 2 }}>
              <ListItem divider>
                <ListItemText primary="Khách (0)" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Yêu cầu tham gia (0)" />
              </ListItem>
            </List>
          </Box>
        </Grid>

        {/* Cột phải: Chi tiết Thành viên - Chiếm 80% */}
        <Grid item xs={12} sm={9} md={10}>
          <Box
            sx={{
              padding: "20px",
              width: "100%",
              borderBottom: "1px solid #D3D3D3",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Thành viên không gian làm việc (1)
            </Typography>
            <Box sx={{ borderBottom: "1px solid #D3D3D3", pb: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                Các thành viên trong Không gian làm việc có thể xem và tham gia
                tất cả các bảng Không gian làm việc hiển thị và tạo ra các bảng
                mới trong Không gian làm việc.
              </Typography>
            </Box>

            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
              Mời các thành viên tham gia cùng bạn
            </Typography>

            <Box
              sx={{
                borderBottom: "1px solid #D3D3D3",
                pb: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="body2" sx={{ color: "gray", flex: 1 }}>
                Bất kỳ ai có liên kết mời đều có thể tham gia Không gian làm
                việc miễn phí này. Bạn cũng có thể tắt và tạo liên kết mới cho
                Không gian làm việc này bất cứ lúc nào. Số lời mời đang chờ xử
                lý được tính vào giới hạn 10 người cộng tác.
              </Typography>

              <Button variant="outlined" startIcon={<LinkIcon />}>
                Mời bằng liên kết
              </Button>
            </Box>

            {/* Lọc thành viên */}
            <Box sx={{ borderBottom: "1px solid #D3D3D3", pb: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Lọc theo tên"
                sx={{ mb: 2, width: "200px" }}
              />
            </Box>

            {/* Danh sách thành viên */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                // borderBottom: "1px solid #D3D3D3",
                // pb: 2,
                // mb: 2,
              }}
            >
              {/* Thông tin thành viên */}
              {members?.map((member) => (
                <Box
                  key={member.id} // Sử dụng key để React có thể tối ưu hóa việc render
                  id="workspace-member-list"
                  sx={{ display: "flex", alignItems: "center", gap: 2 }}
                >
                  <MemberItem member={member} /> {/* Truyền dữ liệu member vào MemberItem */}
                </Box>
              ))}

            </Box>
          </Box>
        </Grid>
      </Grid>

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
    </Box>
  );
};
export default Member;
