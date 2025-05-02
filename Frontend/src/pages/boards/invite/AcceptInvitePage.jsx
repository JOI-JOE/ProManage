import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Box, Container, Typography, Button, Link } from "@mui/material";
import "./AcceptInvitePage.css"; // Import CSS file
import {
  useJoinBoard,
  useRequestJoinBoard,
} from "../../../hooks/useInviteBoard";
import { toast } from "react-toastify";
import LogoLoading from "../../../components/Common/LogoLoading";
import { useQueryClient } from "@tanstack/react-query";

const AcceptInvitePage = () => {
  const { token } = useParams();
  // console.log("token", token); // Debug
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [inviterName, setInviterName] = useState(null);
  const [hasRejected, setHasRejected] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const joinBoardMutation = useRequestJoinBoard(); // Sử dụng custom hook
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const joinBoard = useJoinBoard(); // Gọi ở ngoài

  useEffect(() => {
    const fetchInvite = async () => {
      const authToken = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:8000/api/invite-board/${token}`,
          authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {}
        );

        // ✅ Nếu thành công, set dữ liệu board
        setBoard(response.data.board);
        setIsMember(response.data.is_member);
        setInviterName(response.data.inviter_name);
        setHasRejected(response.data.has_rejected);
      } catch (error) {
        const status = error.response?.status;
        const message = error.response?.data?.message || "Có lỗi xảy ra";

        if (status === 403) {
          // ❌ Trường hợp đã từ chối lời mời trước đó
          setHasRejected(true);
          setError(message);
          setUserId(error.response?.data?.user_id);
          setBoard(error.response?.data?.board_id);
        } else if (status === 409) {
          // ❌ Trường hợp email không trùng khớp
          setError(message);
          // Điều hướng về trang chủ hoặc hiển thị thông báo tùy bạn
          // toast.error("Email của bạn không đúng với người được mời.");
          navigate("/home");
        } else if (status === 404) {
          // ❌ Link mời không tồn tại hoặc đã hết hạn
          setError(message);
          navigate("/404");
        } else {
          // ❌ Lỗi không xác định
          setError("Lỗi không xác định");
          navigate("/404");
        }
      }
    };

    fetchInvite();
  }, [token, navigate, isAuthenticated]);

  const handleJoinBoard = () => {
    joinBoard.mutate(token, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['workspaces'], exact: true });
        queryClient.invalidateQueries({ queryKey: ["user_main"], exact: true });
        navigate(`/b/${data.board_id}/${data.board_name}`);
      },
    });
  };

  const handleRejectInviteBoard = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/reject-invite/${token}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate(`/u/${response?.data.user_name}/boards`);
    } catch (error) {
      setError(error.response?.data?.message || "Error rejecting invite");
    }
  };
  // console.log("userId", board);// có ra data nhé
  const handleRequestRejoin = async () => {
    // console.log(111212);

    try {
      joinBoardMutation.mutate(
        { boardId: board, userId: userId }, // Truyền dữ liệu trực tiếp
        {
          onSuccess: (data) => {
            if (data.success) {
              toast.success("Yêu cầu tham gia đã được gửi!");
              // setMessage("Yêu cầu tham gia đã được gửi!");
              // setIsRequestSent(true); // Cập nhật trạng thái gửi yêu cầu thành công
            } else {
              toast.console.error("Yêu cầu tham gia không thành công!");
            }
          },
        }
      );
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
    }
  };
  if (!isAuthenticated) {
    return (
      <Box className="accept-invite-container">
        <Container className="invite-content">
          <Typography variant="h6" className="invite-title">
            <Box className="font-bold" component="span">
              {inviterName}
            </Box>
            <Box component="span"> đã chia sẻ </Box>
            <Box className="font-bold" component="span">
              {board?.name}
            </Box>
            <Box component="span"> với bạn.</Box>
          </Typography>
          <Button
            variant="contained"
            className="join-button"
            onClick={() => {
              localStorage.setItem("inviteTokenWhenUnauthenticated", token); // Lưu inviteToken vào localStorage
              navigate(`/login`);
            }}
          >
            Đăng nhập
          </Button>
        </Container>
      </Box>
    );
  }

  if (!board && !error && !hasRejected) return <LogoLoading />;

  return (
    <Box className="accept-invite-container">
      <Container className="invite-content">
        {error ? (
          <Box>
            <Typography className="error-message">{error}</Typography>
            {hasRejected && (
              <Button
                variant="contained"
                className="rejoin-button"
                onClick={handleRequestRejoin}
              >
                Yêu cầu tham gia lại
              </Button>
            )}
            <Button
              variant="contained"
              className="back-button"
              onClick={() => navigate("/home")}
            >
              Trở về trang chủ
            </Button>
          </Box>
        ) : (
          <Box>
            {!isMember && (
              <Typography variant="h6" className="invite-title">
                <Box className="font-bold" component="span">
                  {inviterName}
                </Box>
                <Box component="span"> đã chia sẻ </Box>
                <Box className="font-bold" component="span">
                  {board?.name}
                </Box>
                <Box component="span"> với bạn.</Box>
              </Typography>
            )}

            <Typography variant="body1" className="invite-message">
              {isMember
                ? "Bạn đã là thành viên của bảng này."
                : "Nhấn nút bên dưới để tham gia bảng!"}
            </Typography>
            {isMember ? (
              <Button
                variant="contained"
                className="join-button"
                component={Link}
                onClick={() =>
                  navigate(`/b/${board?.id}/${encodeURIComponent(board?.name)}`)
                }
              >
                Đi Tới bảng
              </Button>
            ) : (
              <Button
                variant="contained"
                className="join-button"
                onClick={handleJoinBoard}
              >
                Tham gia bảng
              </Button>
            )}
            {!isMember && (
              <Button
                variant="contained"
                className="reject-button"
                onClick={handleRejectInviteBoard}
              >
                Từ chối tham gia
              </Button>
            )}

            {/* <Box sx={{ mt: 3 }}>
              <Typography variant="body2" sx={{ display: "inline" }}>
                Không phải
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", display: "inline", mx: 0.5 }}
              >
                Quốc Phan
              </Typography>
              <Typography variant="body2" sx={{ display: "inline" }}>
                ?
              </Typography>
              <Link
                href="#"
                className="switch-account-link"
                onClick={(e) => {
                  e.preventDefault();
                  localStorage.removeItem("token");
                  navigate("/login");
                }}
              >
                Chuyển Đổi Tài Khoản
              </Link>
            </Box> */}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default AcceptInvitePage;