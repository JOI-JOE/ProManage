import { Button } from "@mui/material";
import { useJoinWorkspace } from "../../../../hooks/useWorkspaceInvite";
// import { useJoinWorkspace } from "../../../../hooks/useJoinWorkspace"; // <-- dùng đúng hook

const InviteWithToken = ({ inviteData, invitation }) => {
  const token = invitation?.inviteToken; // sửa key đúng là inviteToken
  const inviter = inviteData?.memberInviter;
  const workspace = inviteData?.workspace;

  const { mutate: joinWorkspace, isLoading: isJoining } = useJoinWorkspace();

  const handleAcceptInvite = () => {
    if (!workspace?.id || !token) {
      alert("Dữ liệu lời mời không hợp lệ!");
      return;
    }

    joinWorkspace(
      { workspaceId: workspace.id, token },
      {
        onSuccess: () => {
          alert("Bạn đã tham gia không gian làm việc thành công!");
          window.location.reload();
        },
        onError: (error) => {
          alert(`Lỗi: ${error?.message || "Không thể tham gia workspace"}`);
        },
      }
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Chào mừng bạn đến với ProManage
      </h1>

      <p style={{ fontSize: "22px", marginBottom: "30px" }}>
        <strong>{inviter?.full_name}</strong> đã mời bạn vào{" "}
        <strong>{workspace?.display_name}</strong>
      </p>

      <Button
        variant="contained"
        color="primary"
        onClick={handleAcceptInvite}
        disabled={isJoining}
        sx={{
          borderRadius: "8px",
          textTransform: "none",
          fontSize: "18px",
          margin: "10px 10px",
          padding: "12px 24px",
          backgroundColor: isJoining ? "#9E9E9E" : "#1976D2",
          "&:hover": {
            backgroundColor: isJoining ? "#9E9E9E" : "#1565C0",
          },
        }}
      >
        {isJoining ? "Đang tham gia..." : "Tham gia vào không gian làm việc"}
      </Button>
    </div>
  );
};

export default InviteWithToken;
