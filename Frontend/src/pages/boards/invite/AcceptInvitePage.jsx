import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Box, Container, Typography, Button, Link } from "@mui/material";
import "./AcceptInvitePage.css"; // Import CSS file
import { useRequestJoinBoard } from "../../../hooks/useInviteBoard";
import { toast } from "react-toastify";

const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [isMember, setIsMember] = useState(false);
  const [inviterName, setInviterName] = useState(null);
  const [hasRejected, setHasRejected] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
   const joinBoardMutation = useRequestJoinBoard(); // Sử dụng custom hook

  useEffect(() => {
    const fetchInvite = async () => {
      const authToken = localStorage.getItem("token");
      try {
        const response = await axios.get(
          `http://localhost:8000/api/invite-board/${token}`,
          authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {}
        );
        // console.log("response", response.data);// có ra data nhé 
        // console.log("id-user", response.data.token.tokenable.id);// có ra data nhé 
 
        setBoard(response.data.board);
        setIsMember(response.data.is_member);
        setInviterName(response.data.inviter_name);
        setHasRejected(response.data.has_rejected);
      } catch (error) {
        if (error.response?.status === 403) {
          setHasRejected(true);
          setError(error.response.data.message);
          setUserId(error.response.data.user_id);// có ra data nhé
          setBoard(error.response.data.board_id);
        } else {
          setError(error.response?.data?.message || "Invalid or expired invite link");
          navigate("/404");
        }
      }
    };

    fetchInvite();
  }, [token, navigate]);

  const handleJoinBoard = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/join-board/${token}`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      navigate(`/b/${response.data.board_id}/${response.data.board_name}`);
    } catch (error) {
      setError(error.response?.data?.message || "Error joining board");
    }
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
      navigate(`/home`);
    } catch (error) {
      setError(error.response?.data?.message || "Error rejecting invite");
    }
  };
  // console.log("userId", board);// có ra data nhé
  const handleRequestRejoin = async () => {
    // console.log(111212);
    
    try {
      joinBoardMutation.mutate(
        { boardId: board , userId:userId}, // Truyền dữ liệu trực tiếp
        {
          onSuccess: (data)=> {
            if (data.success) {
              toast.success("Yêu cầu tham gia đã được gửi!");
              // setMessage("Yêu cầu tham gia đã được gửi!");
              // setIsRequestSent(true); // Cập nhật trạng thái gửi yêu cầu thành công
            } else {
              toast.console.error("Yêu cầu tham gia không thành công!");
            }
          }
        }
      );
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      
    }
  };

  if (!board && !error && !hasRejected) return <div>Loading...</div>;

  return (
    <Box className="accept-invite-container">
      <Container className="invite-content">
        {error ? (
          <Box>
            <Typography className="error-message">
              {error}
            </Typography>
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
                <Box className="font-bold" component="span">{inviterName}</Box>
                <Box component="span"> đã chia sẻ </Box>
                <Box className="font-bold" component="span">{board?.name}</Box>
                <Box component="span"> với bạn.</Box>
              </Typography>
            )}

            <Typography variant="body1"  className="invite-message">
              {isMember
                ? "Bạn đã là thành viên của bảng này."
                : "Nhấn nút bên dưới để tham gia bảng!"}
            </Typography>

            <Button
              variant="contained"
              className="join-button"
              onClick={handleJoinBoard}
            >
              {isMember ? "Đi Tới bảng" : "Tham gia bảng"}
            </Button>
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