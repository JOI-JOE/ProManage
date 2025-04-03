import { Fragment, useEffect, useRef, useState } from "react";
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
  Autocomplete,
  SvgIcon,
  Popper,
  ListItemAvatar,
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import loadingLogo from "~/assets/loading.svg?react";

import MemberItem from "./MemberItem";
import GenerateLink from "../../../../components/GenerateLink";
import { useGetWorkspaceByName } from "../../../../hooks/useWorkspace";
import {
  useAddMemberToWorkspace,
  useCancelInvitationWorkspace,
  useConfirmWorkspaceMember,
  useCreateInviteWorkspace,
  useSearchMembers,
} from "../../../../hooks/useWorkspaceInvite";
import WorkspaceInfo from "../../../../components/WorkspaceInfo";
import { useGetInviteWorkspace } from "../../../../hooks/useWorkspaceInvite";

const Member = () => {
  const { workspaceName } = useParams();

  // Dữ liệu để lấy được workspace bằng tên
  const {
    data: workspace,
    isLoading: isLoadingWorkspace,
    isError: isWorkspaceError,
    error: workspaceError,
  } = useGetWorkspaceByName(workspaceName, {
    enabled: !!workspaceName, // Chỉ fetch khi workspaceName tồn tại
  });

  // Dữ liệu để lấy được inviteToken
  const {
    data: inviteData,
    isLoading: isInviteLoading,
    refetch,
  } = useGetInviteWorkspace(workspace?.id, {
    enabled: !!workspace?.id,
  });

  const { mutate: addMember, isLoading, error } = useAddMemberToWorkspace();
  const { mutate: confirmMember } = useConfirmWorkspaceMember();

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]); // Luôn là mảng rỗng ban đầu
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: memberSearch, isLoading: isLoadingMember } = useSearchMembers(
    debouncedValue,
    workspace?.id
  );

  // ✅ Tạo debounce bằng useRef -> Tránh spam API khi gõ nhanh
  const debounceTimeout = useRef(null);

  const handleInputChange = (event) => {
    const value = event.target.value.trim();
    setInputValue(value);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      setDebouncedValue(value.length >= 3 ? value : "");
    }, 300);
  };

  useEffect(() => {
    if (debouncedValue.length >= 3) {
      setOptions(memberSearch || []);
      setOpen(true);
    } else {
      setOptions([]);
      setOpen(false);
    }
  }, [debouncedValue, memberSearch]);

  const handleOptionSelect = (event, newValue) => {
    const newIds = newValue.map((user) => user.id);

    setSelectedUsers(newValue);
    setSelectedUserIds((prevIds) => [...new Set([...prevIds, ...newIds])]);

    if (newIds.length > 0) {
      console.log("📢 Sending API with userIds:", newIds);

      addMember({ workspaceId: workspace.id, userIds: newIds });
    }
    setInputValue("");
    setOptions([]);
  };

  const handleSendInvitations = async () => {
    if (!selectedUsers.length) return;

    const memberIds = selectedUsers.map((user) => user.id);
    console.log("📩 Đang gửi lời mời:", memberIds);

    setIsProcessing(true); // Bắt đầu hiển thị loading

    try {
      // Duyệt qua từng memberId và gửi yêu cầu mời
      for (const memberId of memberIds) {
        await confirmMember({
          workspaceId: workspace.id,
          memberId,
          invitationMessage,
        });
      }

      console.log("✅ Tất cả lời mời đã gửi!");
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Giữ loading một lúc trước khi đóng

      handleCloseInvite(); // Đóng modal sau khi hoàn tất
    } catch (error) {
      console.error("❌ Lỗi khi gửi lời mời:", error);
    } finally {
      setIsProcessing(false); // Mở lại nút sau khi hoàn thành
    }
  };

  const { mutate: createInviteLink, isLoading: isCreatingInvite } =
    useCreateInviteWorkspace();
  const { mutate: cancelInviteLink, isLoading: isCancelingInvite } =
    useCancelInvitationWorkspace();

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
    setFormVisible((prev) => !prev);
  };

  const handleCloseInvite = () => {
    if (isProcessing) return; // Nếu đang xử lý, không cho đóng bảng

    setInviteOpen(false);
    setInputValue("");
    setSelectedUsers([]);
    setOptions([]);
  };

  const members = workspace?.members || [];

  const handleGenerateLink = async () => {
    if (!workspace?.id) {
      throw new Error("Không tìm thấy ID của workspace");
    }
    return new Promise((resolve, reject) => {
      createInviteLink(
        { workspaceId: workspace.id },
        {
          onSuccess: (data) => {
            resolve(data.secret); // Trả về liên kết mới
          },
          onError: (error) => {
            console.error("Lỗi khi tạo link mời:", error);
            reject(error); // Trả về lỗi
          },
        }
      );
    });
  };

  const handleDeleteLink = async () => {
    if (!workspace?.id) {
      throw new Error("Không tìm thấy ID của workspace");
    }
    return cancelInviteLink({ workspaceId: workspace.id });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        padding: "32px 20px 20px 20px",
        // margin: "30px auto",

        overflow: "auto",
        maxHeight: "579px", // Giới hạn chiều cao để kích hoạt scroll
        "&::-webkit-scrollbar": {
          width: "8px",
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          background: "#f1f1f1",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#888",
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
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
        }}
      >
        {!isFormVisible ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar
              sx={{
                bgcolor: "#5D87FF",
                width: "50px",
                height: "50px",
                marginLeft: "100px",
              }}
            >
              <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                {workspace?.display_name.charAt(0).toUpperCase()}
              </span>
            </Avatar>
            <Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <Typography fontWeight="bold" sx={{ fontSize: "1.2rem" }}>
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
            onCancel={toggleFormVisibility} // Đóng form khi hủy
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
              sx={{ fontSize: "0.9rem" }}
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
              sx={{ fontSize: "0.9rem" }}
            >
              Thành viên không gian làm việc (1)
            </Typography>
            <Box sx={{ borderBottom: "1px solid #D3D3D3", pb: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: "gray", fontSize: "0.7rem" }}
              >
                Các thành viên trong Không gian làm việc có thể xem và tham gia
                tất cả các bảng Không gian làm việc hiển thị và tạo ra các bảng
                mới trong Không gian làm việc.
              </Typography>
            </Box>

            <Typography
              variant="h6"
              fontWeight="bold"
              sx={{ mt: 2, fontSize: "0.9rem" }}
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
              <Typography
                variant="body2"
                sx={{ color: "gray", flex: 1, fontSize: "0.7rem" }}
              >
                Bất kỳ ai có liên kết mời đều có thể tham gia Không gian làm
                việc miễn phí này. Bạn cũng có thể tắt và tạo liên kết mới cho
                Không gian làm việc này bất cứ lúc nào. Số lời mời đang chờ xử
                lý được tính vào giới hạn 10 người cộng tác.
              </Typography>

              {/* <Button variant="outlined" startIcon={<LinkIcon />}>
                Mời bằng liên kết
              </Button> */}
            </Box>

            {/* Lọc thành viên */}
            <Box sx={{ borderBottom: "1px solid #D3D3D3", pb: 2, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Lọc theo tên"
                sx={{
                  mb: 2,
                  width: "200px",
                  "& .MuiInputBase-input": { fontSize: "0.6rem" },
                }}
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
                  <MemberItem member={member} />{" "}
                  {/* Truyền dữ liệu member vào MemberItem */}
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
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              width: "100%",
            }}
          >
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1, // 🔥 Giúp Paper mở rộng full width
                  borderRadius: "3px",
                  boxShadow: "inset 0 0 0 1px rgba(9, 30, 66, 0.15)",
                  transition:
                    "background-color 85ms ease, border-color 85ms ease, box-shadow 85ms ease",
                  backgroundColor: "#ffffff",
                  padding: "5px 10px", // 🔥 Tạo khoảng cách padding đẹp hơn
                }}
              >
                <Autocomplete
                  multiple
                  id="custom-autocomplete"
                  options={options.filter(
                    (option) =>
                      !selectedUsers.some((user) => user.id === option.id)
                  )}
                  getOptionLabel={(option) => option.full_name}
                  getOptionDisabled={(option) => option.joined} // 🔥 Vô hiệu hóa nếu đã joined
                  filterOptions={(options, state) =>
                    options.filter(
                      (option) =>
                        option.full_name
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase()) ||
                        option.user_name
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase()) ||
                        option.email
                          ?.toLowerCase()
                          .includes(state.inputValue.toLowerCase())
                    )
                  }
                  disableClearable
                  popupIcon={null}
                  loading={isLoadingMember}
                  loadingText={
                    <Box
                      sx={{ display: "flex", justifyContent: "center", py: 1 }}
                    >
                      <SvgIcon
                        component={loadingLogo}
                        sx={{ width: 50, height: 50, transform: "scale(0.5)" }}
                        viewBox="0 0 24 24"
                        inheritViewBox
                      />
                    </Box>
                  }
                  noOptionsText={
                    isLoadingMember
                      ? "Đang tìm kiếm..."
                      : inputValue.length >= 3
                        ? "Không tìm thấy thành viên nào."
                        : ""
                  }
                  open={open}
                  value={selectedUsers}
                  onChange={handleOptionSelect}
                  fullWidth
                  renderOption={(props, option) => (
                    <ListItem
                      {...props}
                      alignItems="flex-start"
                      disabled={option.joined}
                    >
                      <ListItemAvatar>
                        <Avatar
                          alt={option.full_name}
                          src={
                            option.image || "/static/images/avatar/default.jpg"
                          }
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.full_name}
                        secondary={
                          <Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "text.primary", display: "inline" }}
                            >
                              {option.joined
                                ? option.memberType === "admin"
                                  ? " (Quản trị viên của không gian làm việc)"
                                  : " (Thành viên không gian làm việc)"
                                : ""}
                            </Typography>
                          </Fragment>
                        }
                      />
                    </ListItem>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="standard"
                      placeholder="Nhập tên hoặc email..."
                      InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                      }}
                      onChange={handleInputChange}
                      sx={{ width: "100%", padding: "5px 5px" }}
                    />
                  )}
                  PopperComponent={(props) => (
                    <Popper
                      {...props}
                      modifiers={[
                        { name: "offset", options: { offset: [0, 15] } },
                      ]}
                    />
                  )}
                  sx={{
                    flex: 1,
                    "& .MuiAutocomplete-tag": {
                      maxWidth: "150px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    },
                    "& .MuiAutocomplete-inputRoot": {
                      maxHeight: "100px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": { width: "5px" },
                      "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#aaa",
                        borderRadius: "10px",
                      },
                      "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#888",
                      },
                    },
                  }}
                />
              </Paper>
              {selectedUsers.length > 0 &&
                (isProcessing ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <SvgIcon
                      component={loadingLogo}
                      sx={{
                        width: 50,
                        height: 50,
                        transform: "scale(0.5)", // Giữ nguyên tỷ lệ nhưng thu nhỏ
                      }}
                      viewBox="0 0 24 24"
                      inheritViewBox
                    />
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ height: "40px", textTransform: "none" }}
                    onClick={handleSendInvitations}
                    disabled={isProcessing} // Chặn nhấn nút khi đang loading
                  >
                    Gửi lời mời
                  </Button>
                ))}
            </Box>
            {selectedUsers.length > 0 && (
              <TextField
                id="outlined-textarea"
                placeholder="Tham gia Không gian làm việc Trello này để bắt đầu cộng tác với tôi!"
                multiline
                maxRows={2}
                fullWidth
                value={invitationMessage} // Gán giá trị từ state
                onChange={(e) => setInvitationMessage(e.target.value)} // Cập nhật state khi nhập
                disabled={isProcessing} // Vô hiệu hóa khi đang xử lý
                sx={{
                  "& .MuiInputBase-input": { color: "gray" },
                  "& .MuiInputLabel-root": { color: "#9FADBC" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#579DFF" },
                }}
              />
            )}
          </Box>

          {isInviteLoading || isLoadingWorkspace ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
              }}
            >
              <SvgIcon
                component={loadingLogo}
                sx={{
                  width: 50,
                  height: 50,
                  transform: "scale(0.5)", // Giữ nguyên tỷ lệ nhưng thu nhỏ
                }}
                viewBox="0 0 24 24"
                inheritViewBox
              />
            </Box>
          ) : (
            // Đây là component dùng để tạo ra invite token
            <GenerateLink
              onGenerateLink={handleGenerateLink}
              onDeleteLink={handleDeleteLink}
              secret={inviteData?.invitationSecret}
              workspaceId={workspace?.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
export default Member;
