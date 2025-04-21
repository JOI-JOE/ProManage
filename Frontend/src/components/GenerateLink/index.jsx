import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Stack } from "@mui/material";
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

  // Cập nhật generatedLink khi secret hoặc workspaceId thay đổi
  useEffect(() => {
    if (secret && workspaceId) {
      setGeneratedLink(`http://localhost:5173/invite/${workspaceId}/${secret}`);
      setIsLinkActive(true);
    } else {
      setGeneratedLink("");
      setIsLinkActive(false);
    }
  }, [secret, workspaceId]);

  // Hàm xử lý tạo liên kết
  const handleGenerateLink = async () => {
    if (isCreatingInvite) return; // Ngăn gọi lại khi đang xử lý
    try {
      await onGenerateLink(); // Chờ onGenerateLink hoàn tất
      // Không cần setGeneratedLink ở đây vì useEffect sẽ xử lý khi secret thay đổi
    } catch (error) {
      console.error("Lỗi khi tạo link:", error);
    }
  };

  // Hàm xử lý sao chép liên kết
  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setLinkCopied(true);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 3000);
    }
  };

  // Hàm xử lý xóa liên kết
  const handleDeleteLink = async () => {
    if (isCancelingInvite) return; // Ngăn gọi lại khi đang xử lý
    try {
      await onDeleteLink();
      setIsLinkActive(false);
      setLinkCopied(false);
      setGeneratedLink("");
    } catch (error) {
      console.error("Lỗi khi xóa link:", error);
    }
  };

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
          {isCreatingInvite
            ? "Đang tạo liên kết..."
            : isLinkActive
              ? 'Liên kết đã tạo, nhấn "Sao chép liên kết"'
              : 'Nhấn "Tạo liên kết" để tạo link mời'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={isLinkActive ? handleCopyLink : handleGenerateLink}
          disabled={isCreatingInvite || isCancelingInvite}
        >
          {isLinkActive ? "Sao chép liên kết" : "Tạo liên kết"}
        </Button>
      </Stack>
      {isLinkActive && (
        <Typography
          variant="body2"
          color="primary"
          sx={{
            cursor: isCancelingInvite ? "not-allowed" : "pointer",
            textDecoration: "underline",
            textAlign: "right",
          }}
          onClick={handleDeleteLink}
        >
          {isCancelingInvite ? "Đang tắt liên kết..." : "Tắt liên kết"}
        </Typography>
      )}
      {showCopiedMessage && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <CheckCircleIcon sx={{ color: "green", fontSize: 16 }} />
          <Typography variant="body2" color="green">
            Đã sao chép liên kết!
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default GenerateLink;