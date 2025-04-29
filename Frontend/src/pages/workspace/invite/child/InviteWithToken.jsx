import { Button } from "@mui/material";
import { useJoinWorkspace } from "../../../../hooks/useWorkspaceInvite";
import { useState } from "react";
import LogoLoading from "../../../../components/Common/LogoLoading";
import { useMe } from "../../../../contexts/MeContext";
import { useNavigate } from "react-router-dom";

const InviteWithToken = ({ inviteData, invitation }) => {
  const navigate = useNavigate()
  const token = invitation?.inviteToken;
  const inviter = inviteData?.memberInviter;
  const workspace = inviteData?.workspace;
  const [loading, setLoading] = useState(false);

  const { mutate: joinWorkspace, isLoading: isJoining } = useJoinWorkspace();

  const handleAcceptInvite = () => {
    if (!workspace?.id || !token) {
      alert("Dữ liệu lời mời không hợp lệ!");
      return;
    }

    setLoading(true);

    joinWorkspace(
      { workspaceId: workspace.id, token },
      {
        onSuccess: () => {
          window.location.reload();
          window.location.href = `/w/${workspace.id}`;
        },
        onError: (error) => {
          alert(`Lỗi: ${error?.message || "Không thể tham gia workspace"}`);
          setLoading(false);
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
        {loading ? (
          <>
            <LogoLoading scale={0.4} />
          </>
        ) : (
          "Tham gia vào không gian làm việc"
        )}
      </Button>
    </div>
  );
};

export default InviteWithToken;
