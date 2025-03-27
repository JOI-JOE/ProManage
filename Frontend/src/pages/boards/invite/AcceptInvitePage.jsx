import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./AcceptInvitePage.css"; // Import CSS file for styling
import { Box } from "@mui/material";

const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/invite-board/${token}`
        );
        setBoard(response.data.board);
      } catch (error) {
        setError("Invalid or expired invite link");
        navigate("/404");
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
      navigate(`/b/${board.id}/${board.name}`);
    } catch (error) {
      setError(error.response?.data?.message || "Error joining board");
    }
  };

  if (!board && !error) return <div>Loading...</div>;

  return (
    <Box
      sx={{
        height: (theme) =>
          `calc( ${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight} )`,
      }}
      className="invite-container"
      style={{
        backgroundImage:
          'url("https://i.pinimg.com/736x/72/05/12/72051223b3f5f6c309a8c03ac0a790e7.jpg")',
      }}
    >
      {error ? (
        <p className="error-message" style={{ color: "white" }}>
          {error}
        </p>
      ) : (
        <>
          <h1
            className="invite-title"
            style={{ color: "white", fontWeight: "bold" }}
          >
            Mời bạn tham gia bảng "{board?.name}"
          </h1>
          <p
            className="invite-description"
            style={{ color: "white", fontWeight: "bold" }}
          >
            Bạn đã được mời tham gia bảng này. Nhấn nút bên dưới để vào bảng!
          </p>
          <button className="join-button" onClick={handleJoinBoard}>
            Vào bảng
          </button>
        </>
      )}
    </Box>
  );
};

export default AcceptInvitePage;
