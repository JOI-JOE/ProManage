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

import MemberItem from "./MemberItem";
import GenerateLink from "../../../../components/GenerateLink";
import { useGetWorkspaceByName } from "../../../../hooks/useWorkspace";
import { useCancelInvitationWorkspace, useCreateInviteWorkspace } from "../../../../hooks/useWorkspaceInvite";
import WorkspaceInfo from "../../../../components/WorkspaceInfo";

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


  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  const handleCloseInvite = () => {
    setInviteOpen(false);
  };

  const handleDisableLink = () => {
    setIsLinkActive(false);
    setLinkCopied(false);
  };

  const { workspaceName } = useParams();
  const { data: workspace, isLoading: isLoadingWorkspace } = useGetWorkspaceByName(workspaceName, {
    enabled: !!workspaceName,
  });

  const members = workspace?.members || [];

  const { mutate: createInviteLink, isLoading: isCreatingInvite } = useCreateInviteWorkspace();
  const { mutate: cancelInviteLink, isLoading: isCancelingInvite } = useCancelInvitationWorkspace();

  const handleGenerateLink = async () => {
    if (!workspace) {
      console.error("Workspace data is not available yet");
      throw new Error("Vui lòng đợi dữ liệu workspace được tải xong");
    }

    if (!workspace.id) {
      console.error("Workspace ID is undefined");
      throw new Error("Không tìm thấy ID của workspace");
    }

    return new Promise((resolve, reject) => {
      createInviteLink(
        { workspaceId: workspace.id },
        {
          onSuccess: (data) => {
            // Tạo link mời với format: http://localhost:5173/invite/:workspaceId/:inviteToken
            const inviteLink = `http://localhost:5173/invite/${workspace.id}/${data.secret}`;
            resolve(inviteLink);
          },
          onError: (error) => {
            console.error("Lỗi khi tạo link mời:", error);
            reject(error);
          },
        }
      );
    });
  };

  const handleDeleteLink = async () => {
    if (!workspace?.id) {
      throw new Error('Không tìm thấy ID của workspace');
    }
    return cancelInviteLink({ workspaceId: workspace.id });
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
        {isFormVisible ? (
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
          <WorkspaceInfo
            workspaceInfo={workspace}
            onCancel={toggleFormVisibility} // Truyền hàm đóng form
          />
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


      {/* Nội dung */}
      <Grid
        container
        spacing={2}
        sx={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}
      >

        {/* Cột trái:  */}
        <Grid item xs={12} sm={3} md={2}>
          <Box sx={{ padding: "0px", width: "100%" }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ fontSize: "20px" }}
            >
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

        {/* Cột phải:  */}
        <Grid item xs={12} sm={9} md={10}>
          <Box
            sx={{
              padding: "20px",
              width: "100%",
              borderBottom: "1px solid #D3D3D3",
            }}
          >
            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ fontSize: "20px" }}
            >
              Thành viên không gian làm việc (1)
            </Typography>
            <Box sx={{ borderBottom: "1px solid #D3D3D3", pb: 2, mb: 2 }}>
              <Typography variant="body2" sx={{ color: "gray" }}>
                Các thành viên trong Không gian làm việc có thể xem và tham gia
                tất cả các bảng Không gian làm việc hiển thị và tạo ra các bảng
                mới trong Không gian làm việc.
              </Typography>
            </Box>

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mt: 2, fontSize: "20px" }}
            >
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
                flexDirection: "column", // Hiển thị theo hàng dọc
                alignItems: "flex-start", // Căn lề trái cho các thành viên
                gap: 2, // Khoảng cách giữa các thành viên
              }}
            >
              {/* Thông tin thành viên */}
              {members?.map((member, index) => (
                <Box
                  key={`${member.id}-${index}`} // Kết hợp member.id và index để tạo key duy nhất
                  id="workspace-member-list"
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
          <GenerateLink onGenerateLink={handleGenerateLink} onDeleteLink={handleDeleteLink} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default Member;
