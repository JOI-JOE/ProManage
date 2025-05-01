import { Fragment, useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  Autocomplete,
  SvgIcon,
  Popper,
  ListItemAvatar,
  IconButton,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate, useParams } from "react-router-dom";
import loadingLogo from "~/assets/loading.svg?react";
import MemberItem from "./MemberItem";
import GenerateLink from "../../../../components/GenerateLink";
import { useGetWorkspaceById } from "../../../../hooks/useWorkspace";
import {
  useCancelInvitationWorkspace,
  useCreateInviteWorkspace,
  useSearchMembers,
  useSendInviteWorkspace,
} from "../../../../hooks/useWorkspaceInvite";
import { useGetInviteWorkspace } from "../../../../hooks/useWorkspaceInvite";
import { useMe } from "../../../../contexts/MeContext";
import Request from "./Component/Request";
import Guest from "./Component/Guest";
import WorkspaceHeader from "./Common/WorkspaceHeader";

const Member = () => {
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

  const isAdminWorkspace = workspace?.isCurrentUserAdmin;
  const [isAdmin, setIsAdmin] = useState(isAdminWorkspace);

  useEffect(() => {
    if (isAdminWorkspace !== undefined) {
      setIsAdmin(isAdminWorkspace);
    }
  }, [isAdminWorkspace]);

  const {
    data: inviteData,
    isLoading: isInviteLoading,
    refetch: refetchInvite,
  } = useGetInviteWorkspace(workspace?.id, {
    enabled: !!workspace?.id && isAllowed,
  });

  const { mutate: createInviteLink, isLoading: isCreatingInvite } = useCreateInviteWorkspace();
  const { mutate: cancelInviteLink, isLoading: isCancelingInvite } = useCancelInvitationWorkspace();

  const [inputValue, setInputValue] = useState("");
  const [options, setOptions] = useState([]);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState(new Set());
  const [invitationMessage, setInvitationMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [isInviteOpen, setInviteOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('members');
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const { data: memberSearch, isLoading: isLoadingMember } = useSearchMembers(
    debouncedValue,
    workspace?.id
  );

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
    setSelectedUserIds(new Set(newIds));
    setInputValue("");
    setOptions([]);
  };

  const { mutate: sendInvites } = useSendInviteWorkspace(workspace?.id);

  const handleSendInvitations = async () => {
    if (!selectedUsers.length) {
      setSnackbar({ open: true, message: "Vui lòng chọn ít nhất một người để gửi lời mời", severity: "warning" });
      return;
    }

    const invalidEmails = selectedUsers
      .filter((user) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      .map((user) => user.email);

    if (invalidEmails.length > 0) {
      setSnackbar({ open: true, message: `Email không hợp lệ: ${invalidEmails.join(", ")}`, severity: "error" });
      return;
    }

    setIsProcessing(true);

    try {
      for (const user of selectedUsers) {
        const memberPayload = {
          workspaceId: workspace.id,
          email: user.email,
          memberId: user.id?.startsWith("new-") ? null : user.id,
          message: invitationMessage,
        };

        await new Promise((resolve, reject) => {
          sendInvites(memberPayload, {
            onSuccess: (data) => {
              if (data?.error) {
                reject(new Error(data.error));
              } else {
                resolve(data);
              }
            },
            onError: reject,
          });
        });
      }

      setSnackbar({ open: true, message: "Đã gửi tất cả lời mời!", severity: "success" });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      refetchWorkspace();
      handleCloseInvite();
    } catch (error) {
      const errorMessage = error.message === "Lời mời đã được gửi đến email này trong không gian làm việc này"
        ? error.message
        : "Không thể gửi lời mời. Vui lòng thử lại.";
      setSnackbar({ open: true, message: errorMessage, severity: "error" });
      console.error("Lỗi khi gửi lời mời:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenInvite = () => {
    setInviteOpen(true);
  };

  const toggleFormVisibility = () => {
    setFormVisible((prev) => !prev);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleCloseInvite = () => {
    if (isProcessing) return;
    setInviteOpen(false);
    setInputValue("");
    setSelectedUsers([]);
    setSelectedUserIds(new Set());
    setOptions([]);
    setInvitationMessage("");
  };

  const handleGenerateLink = async () => {
    if (!workspace?.id) {
      setSnackbar({ open: true, message: "Không tìm thấy ID của workspace", severity: "error" });
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        createInviteLink(
          { workspaceId: workspace.id },
          {
            onSuccess: (data) => {
              refetchInvite();
              setSnackbar({ open: true, message: "Đã tạo liên kết mời!", severity: "success" });
              resolve(data.secret);
            },
            onError: (error) => {
              setSnackbar({ open: true, message: "Không thể tạo liên kết mời. Vui lòng thử lại.", severity: "error" });
              console.error("Lỗi khi tạo link mời:", error);
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      // Lỗi đã được xử lý trong onError
    }
  };

  const handleDeleteLink = async () => {
    if (!workspace?.id) {
      setSnackbar({ open: true, message: "Không tìm thấy ID của workspace", severity: "error" });
      return;
    }

    try {
      await new Promise((resolve, reject) => {
        cancelInviteLink(
          { workspaceId: workspace.id },
          {
            onSuccess: () => {
              refetchInvite();
              setSnackbar({ open: true, message: "Đã hủy liên kết mời!", severity: "success" });
              resolve();
            },
            onError: (error) => {
              setSnackbar({ open: true, message: "Không thể hủy liên kết mời. Vui lòng thử lại.", severity: "error" });
              console.error("Lỗi khi hủy link mời:", error);
              reject(error);
            },
          }
        );
      });
    } catch (error) {
      // Lỗi đã được xử lý trong onError
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: "", severity: "info" });
  };

  const members = workspace?.members || [];
  const requests = workspace?.requests || [];
  const guests = workspace?.guests || [];

  const filteredMembers = members?.filter((member) =>
    member.user?.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (userLoading || !checked || isLoadingWorkspace) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
        <SvgIcon
          component={loadingLogo}
          sx={{ width: 50, height: 50, transform: "scale(0.5)" }}
          viewBox="0 0 24 24"
          inheritViewBox
        />
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
    <Box>
      <WorkspaceHeader
        workspace={workspace}
        isAdmin={isAdmin}
        isFormVisible={isFormVisible}
        toggleFormVisibility={toggleFormVisibility}
        handleOpenInvite={handleOpenInvite}
        refetchWorkspace={refetchWorkspace}
        allowInvite
      />

      <Grid container spacing={2} sx={{ width: "100%", maxWidth: "1100px", margin: "0 auto" }}>
        <Grid item xs={12} sm={4} md={2}>
          <Box sx={{ padding: '0px', width: '100%' }}>
            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '0.9rem' }}>
              Người cộng tác
            </Typography>
            <Chip
              label={`${members.length} / 10`}
              size="small"
              sx={{ fontSize: '12px', backgroundColor: '#F4F5F7' }}
            />
            <List sx={{ padding: 0, marginTop: 2, display: "grid", gap: 2 }}>
              <ListItem
                selected={activeTab === 'members'}
                onClick={() => handleTabChange('members')}
                sx={{
                  cursor: "pointer",
                  backgroundColor: activeTab === 'members' ? '#E8F0FE' : 'transparent',
                  borderRadius: 1,
                  padding: '8px 16px',
                  '&:hover': { backgroundColor: '#E8F0FE' },
                  '& .MuiListItemText-primary': {
                    color: activeTab === 'members' ? 'primary.main' : 'text.primary',
                    fontWeight: activeTab === 'members' ? 'bold' : 'normal',
                  },
                }}
              >
                <ListItemText primary={`Thành viên không gian làm việc (${members.length})`} />
              </ListItem>
              <ListItem
                onClick={() => handleTabChange('guests')}
                sx={{
                  cursor: "pointer",
                  backgroundColor: activeTab === 'guests' ? '#E8F0FE' : 'transparent',
                  borderRadius: 1,
                  padding: '8px 16px',
                  '&:hover': { backgroundColor: '#E8F0FE' },
                  '& .MuiListItemText-primary': {
                    color: activeTab === 'guests' ? 'primary.main' : 'text.primary',
                    fontWeight: activeTab === 'guests' ? 'bold' : 'normal',
                  },
                }}
              >
                <ListItemText primary={`Khách (${guests.length})`} />
              </ListItem>
              {isAdmin && (
                <ListItem
                  onClick={() => handleTabChange('requests')}
                  sx={{
                    cursor: "pointer",
                    backgroundColor: activeTab === 'requests' ? '#E8F0FE' : 'transparent',
                    borderRadius: 1,
                    padding: '8px 16px',
                    '&:hover': { backgroundColor: '#E8F0FE' },
                    '& .MuiListItemText-primary': {
                      color: activeTab === 'requests' ? 'primary.main' : 'text.primary',
                      fontWeight: activeTab === 'requests' ? 'bold' : 'normal',
                    },
                  }}
                >
                  <ListItemText primary={`Yêu cầu tham gia (${requests.length})`} />
                </ListItem>
              )}
            </List>
          </Box>
        </Grid>

        <Grid item xs={12} sm={8} md={10}>
          <Box sx={{ padding: '20px', width: '100%', borderBottom: '1px solid #D3D3D3' }}>
            {activeTab === 'members' && (
              <>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                  Thành viên không gian làm việc ({members.length})
                </Typography>
                <Box sx={{ borderBottom: '1px solid #D3D3D3', pb: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'gray', fontSize: '0.7rem' }}>
                    Các thành viên trong Không gian làm việc có thể xem và tham gia tất cả các bảng Không gian làm việc hiển thị và tạo ra các bảng mới trong Không gian làm việc.
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                  Mời các thành viên tham gia cùng bạn
                </Typography>
                <Box sx={{ borderBottom: '1px solid #D3D3D3', pb: 2, mb: 2 }}>
                  <Typography variant="body2" sx={{ color: 'gray', fontSize: '0.7rem' }}>
                    Bất kỳ ai có liên kết mời đều có thể tham gia Không gian làm việc miễn phí này. Bạn cũng có thể tắt và tạo liên kết mới cho Không gian làm việc này bất cứ lúc nào. Số lời mời đang chờ xử lý được tính vào giới hạn 10 người cộng tác.
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Lọc theo tên"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Box
                  sx={{
                    maxHeight: 3 * 62,
                    overflowY: 'auto',
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#B6BBBF",
                      borderRadius: "6px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                      backgroundColor: "#ECF0F1",
                    },
                  }}
                >
                  {filteredMembers?.map((member, index) => (
                    <Box
                      key={`member-${member.id}-${index}`}
                      sx={{
                        mb: 1,
                        "&:last-child": {
                          mb: 0,
                        }
                      }}
                    >
                      <MemberItem
                        member={member}
                        workspace={workspace}
                        boards={workspace?.boards}
                        isAdmin={isAdmin}
                      />
                    </Box>
                  ))}
                </Box>
              </>
            )}
            {activeTab === 'guests' && (
              <Guest isAdmin={isAdmin} guests={guests} workspaceId={workspaceId} boards={workspace?.boards} />
            )}
            {activeTab === 'requests' && (
              <Request isAdmin={isAdmin} requests={requests} workspaceId={workspaceId} />
            )}
          </Box>
        </Grid>
      </Grid>

      <Dialog open={isInviteOpen} onClose={handleCloseInvite} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontSize: "20px" }}>
          Mời vào Không gian làm việc
          <IconButton sx={{ position: "absolute", right: 8, top: 8 }} onClick={handleCloseInvite}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: 0 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%", padding: "16px 24px" }}>
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
              <Paper
                elevation={0}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: 1,
                  borderRadius: "3px",
                  boxShadow: "inset 0 0 0 1px rgba(9, 30, 66, 0.15)",
                  backgroundColor: "#ffffff",
                  padding: "5px 10px",
                }}
              >
                <Autocomplete
                  multiple
                  id="custom-autocomplete"
                  options={options.filter((option) => !selectedUsers.some((user) => user.id === option.id))}
                  getOptionLabel={(option) => option.full_name || option.email || ""}
                  getOptionDisabled={(option) => option.joined}
                  filterOptions={(options, state) => {
                    const trimmedInput = state.inputValue.trim().toLowerCase();
                    const isEmailInput = /^[^\s@]+@[^\s@]+/.test(trimmedInput);
                    const filteredOptions = options.filter(
                      (option) =>
                        option.full_name?.toLowerCase().includes(trimmedInput) ||
                        option.user_name?.toLowerCase().includes(trimmedInput) ||
                        option.email?.toLowerCase().includes(trimmedInput)
                    );
                    if (
                      isEmailInput &&
                      trimmedInput.length > 0 &&
                      !filteredOptions.some((option) => option.email?.toLowerCase() === trimmedInput) &&
                      !selectedUsers.some((u) => u.email?.toLowerCase() === trimmedInput)
                    ) {
                      return [
                        ...filteredOptions,
                        {
                          full_name: `Thêm "${state.inputValue}"`,
                          email: state.inputValue,
                          isNewEmail: true,
                        },
                      ];
                    }
                    return filteredOptions;
                  }}
                  disableClearable
                  popupIcon={null}
                  loading={isLoadingMember}
                  loadingText={
                    <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
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
                  onOpen={() => setOpen(true)}
                  onClose={() => setOpen(false)}
                  value={selectedUsers}
                  onChange={handleOptionSelect}
                  onInputChange={(event, newValue, reason) => {
                    if (reason === 'input') {
                      setInputValue(newValue);
                      handleInputChange({ target: { value: newValue } });
                    }
                  }}
                  fullWidth
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.id}
                        label={option.email || option.full_name}
                        {...getTagProps({ index })}
                        onDelete={() => {
                          const newSelectedUsers = selectedUsers.filter((user) => user.id !== option.id);
                          setSelectedUsers(newSelectedUsers);
                          setSelectedUserIds((prevIds) => {
                            const newIds = new Set(prevIds);
                            newIds.delete(option.id);
                            return newIds;
                          });
                        }}
                      />
                    ))
                  }
                  renderOption={(props, option) => (
                    <ListItem {...props} alignItems="flex-start" disabled={option.joined}>
                      <ListItemAvatar>
                        <Avatar
                          alt={option.full_name}
                          src={option.image || "/static/images/avatar/default.jpg"}
                        />
                      </ListItemAvatar>
                      <ListItemText
                        primary={option.isNewEmail ? option.full_name : option.full_name}
                        secondary={
                          <Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              sx={{ color: "text.primary", display: "inline" }}
                            >
                              {option.isNewEmail
                                ? option.email
                                : option.joined
                                  ? option.memberType === "admin"
                                    ? " (Quản trị viên của không gian làm việc)"
                                    : " (Thành viên không gian làm việc)"
                                  : option.email || ""}
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
                      InputProps={{ ...params.InputProps, disableUnderline: true }}
                      onChange={(e) => {
                        setInputValue(e.target.value);
                        handleInputChange(e);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && inputValue.trim()) {
                          e.preventDefault();
                          const trimmedInput = inputValue.trim();
                          const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedInput);
                          const emailExists =
                            selectedUsers.some((u) => u.email?.toLowerCase() === trimmedInput.toLowerCase()) ||
                            options.some((o) => o.email?.toLowerCase() === trimmedInput.toLowerCase());
                          if (!isEmail) {
                            setSnackbar({ open: true, message: "Vui lòng nhập email hợp lệ!", severity: "error" });
                            return;
                          }
                          if (emailExists) {
                            setSnackbar({ open: true, message: "Email này đã được thêm hoặc đã tồn tại!", severity: "error" });
                            return;
                          }
                          const newUser = {
                            id: `new-${Date.now()}`,
                            full_name: trimmedInput,
                            email: trimmedInput,
                            image: null,
                            joined: false,
                            isNewEmail: true,
                          };
                          handleOptionSelect(null, [...selectedUsers, newUser]);
                          setInputValue("");
                          setOpen(false);
                        }
                      }}
                      value={inputValue}
                      sx={{ width: "100%", padding: "5px 5px" }}
                    />
                  )}
                  PopperComponent={(props) => (
                    <Popper {...props} modifiers={[{ name: "offset", options: { offset: [0, 15] } }]} />
                  )}
                  sx={{
                    flex: 1,
                    "& .MuiAutocomplete-tag": { maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" },
                    "& .MuiAutocomplete-inputRoot": {
                      maxHeight: "100px",
                      overflowY: "auto",
                      overflowX: "hidden",
                      scrollbarWidth: "thin",
                      "&::-webkit-scrollbar": { width: "5px" },
                      "&::-webkit-scrollbar-thumb": { backgroundColor: "#aaa", borderRadius: "10px" },
                      "&::-webkit-scrollbar-thumb:hover": { backgroundColor: "#888" },
                    },
                  }}
                />
              </Paper>
              {selectedUsers.length > 0 && (
                isProcessing ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <SvgIcon
                      component={loadingLogo}
                      sx={{ width: 50, height: 50, transform: "scale(0.5)" }}
                      viewBox="0 0 24 24"
                      inheritViewBox
                    />
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    sx={{ height: "40px", textTransform: "none" }}
                    onClick={handleSendInvitations}
                    disabled={isProcessing}
                  >
                    Gửi lời mời
                  </Button>
                )
              )}
            </Box>
            {selectedUsers.length > 0 && (
              <TextField
                id="outlined-textarea"
                placeholder="Tham gia Không gian làm việc Trello này để bắt đầu cộng tác với tôi!"
                multiline
                maxRows={2}
                fullWidth
                value={invitationMessage}
                onChange={(e) => setInvitationMessage(e.target.value)}
                disabled={isProcessing}
                sx={{
                  "& .MuiInputBase-input": { color: "gray" },
                  "& .MuiInputLabel-root": { color: "#9FADBC" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#579DFF" },
                }}
              />
            )}
            {isInviteLoading || isLoadingWorkspace ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60px" }}>
                <SvgIcon
                  component={loadingLogo}
                  sx={{ width: 50, height: 50, transform: "scale(0.5)" }}
                  viewBox="0 0 24 24"
                  inheritViewBox
                />
              </Box>
            ) : (
              <Box sx={{ paddingBottom: "16px" }}>
                <GenerateLink
                  onGenerateLink={handleGenerateLink}
                  onDeleteLink={handleDeleteLink}
                  secret={inviteData?.invitationSecret}
                  workspaceId={workspace?.id}
                  isCreatingInvite={isCreatingInvite}
                  isCancelingInvite={isCancelingInvite}
                />
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Member;