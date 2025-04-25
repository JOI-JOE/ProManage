import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Stack, CircularProgress, Snackbar, Alert } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const GenerateLink = ({
  onGenerateLink,
  onDeleteLink,
  secret,
  workspaceId,
  isCreatingInvite,
  isCancelingInvite,
}) => {
  const [linkCopied, setLinkCopied] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [isLinkActive, setIsLinkActive] = useState(false);
  const [generatedLink, setGeneratedLink] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  // Local loading states to prevent duplicate clicks
  const [isLocalGenerating, setIsLocalGenerating] = useState(false);
  const [isLocalCanceling, setIsLocalCanceling] = useState(false);
  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  // Cập nhật generatedLink khi secret hoặc workspaceId thay đổi
  useEffect(() => {
    if (secret && workspaceId) {
      setGeneratedLink(`http://localhost:5173/invite/${workspaceId}/${secret}`);
      setIsLinkActive(true);
      // Reset generating state when link is successfully created
      setIsLocalGenerating(false);
    } else {
      setGeneratedLink("");
      setIsLinkActive(false);
      // Reset canceling state when link is successfully deleted
      setIsLocalCanceling(false);
    }
  }, [secret, workspaceId]);

  // Reset local generating state when server state changes
  useEffect(() => {
    if (!isCreatingInvite && isLocalGenerating) {
      setIsLocalGenerating(false);
    }
  }, [isCreatingInvite]);

  // Reset local canceling state when server state changes
  useEffect(() => {
    if (!isCancelingInvite && isLocalCanceling) {
      setIsLocalCanceling(false);
    }
  }, [isCancelingInvite]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Hàm xử lý tạo liên kết
  const handleGenerateLink = async () => {
    // Prevent multiple clicks
    if (isCreatingInvite || isLocalGenerating) return;

    // Set local loading immediately to prevent duplicate clicks
    setIsLocalGenerating(true);

    if (!workspaceId) {
      setSnackbar({
        open: true,
        message: "Không tìm thấy ID của workspace",
        severity: "error"
      });
      setIsLocalGenerating(false);
      return;
    }

    try {
      await onGenerateLink();
      // Note: we don't reset isLocalGenerating here because the useEffect will handle it
      // when the secret is updated from the parent component
    } catch (error) {
      console.error("Lỗi khi tạo link:", error);
      setIsLocalGenerating(false);
    }
  };

  // Hàm xử lý sao chép liên kết
  const handleCopyLink = async () => {
    if (generatedLink && !isCopying) {
      setIsCopying(true);
      try {
        await navigator.clipboard.writeText(generatedLink);
        setLinkCopied(true);
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 3000);
      } catch (error) {
        console.error("Lỗi khi sao chép:", error);
        setSnackbar({
          open: true,
          message: "Không thể sao chép liên kết. Vui lòng thử lại.",
          severity: "error"
        });
      } finally {
        setIsCopying(false);
      }
    }
  };

  // Hàm xử lý xóa liên kết
  const handleDeleteLink = async () => {
    if (isCancelingInvite || isLocalCanceling) return;

    setIsLocalCanceling(true);

    try {
      await onDeleteLink();
      // Note: we don't reset isLocalCanceling here because the useEffect will handle it
      // when the secret is cleared from the parent component
    } catch (error) {
      console.error("Lỗi khi xóa link:", error);
      setSnackbar({
        open: true,
        message: "Không thể tắt liên kết. Vui lòng thử lại.",
        severity: "error"
      });
      setIsLocalCanceling(false);
    }
  };

  // Calculated states for UI rendering
  const isGeneratingLink = isCreatingInvite || isLocalGenerating;
  const isCancelingLink = isCancelingInvite || isLocalCanceling;
  const showLinkAsActive = isLinkActive && secret && workspaceId;

  return (
    <Stack direction="column" spacing={1}>
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
        <Typography variant="body2" color="textSecondary">
          {isGeneratingLink
            ? "Đang tạo liên kết..."
            : showLinkAsActive
              ? 'Liên kết đã tạo, nhấn "Sao chép liên kết"'
              : 'Nhấn "Tạo liên kết" để tạo link mời'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={showLinkAsActive ? handleCopyLink : handleGenerateLink}
          disabled={isGeneratingLink || isCancelingLink || isCopying}
          startIcon={
            (isGeneratingLink && !showLinkAsActive) || isCopying ?
              <CircularProgress size={16} color="inherit" /> :
              null
          }
        >
          {showLinkAsActive
            ? (isCopying ? "Đang sao chép..." : "Sao chép liên kết")
            : (isGeneratingLink ? "Đang tạo..." : "Tạo liên kết")}
        </Button>
      </Stack>
      {showLinkAsActive && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          {isCancelingLink && (
            <CircularProgress size={12} color="primary" />
          )}
          <Typography
            variant="body2"
            color="primary"
            sx={{
              cursor: isCancelingLink ? "not-allowed" : "pointer",
              textDecoration: "underline",
            }}
            onClick={isCancelingLink ? undefined : handleDeleteLink}
          >
            {isCancelingLink ? "Đang tắt liên kết..." : "Tắt liên kết"}
          </Typography>
        </Box>
      )}
      {showCopiedMessage && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <CheckCircleIcon sx={{ color: "green", fontSize: 16 }} />
          <Typography variant="body2" color="green">
            Đã sao chép liên kết!
          </Typography>
        </Box>
      )}

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};

export default GenerateLink;