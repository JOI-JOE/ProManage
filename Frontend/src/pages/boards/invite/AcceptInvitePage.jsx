import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AcceptInvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/invite-board/${token}`);
        setBoard(response.data.board);
      } catch (error) {
        setError('Invalid or expired invite link');
        navigate('/404');
      }
    };

    fetchInvite();
  }, [token, navigate]);

  const handleJoinBoard = async () => {
    try {
      const response = await axios.post(
        `http://localhost:8000/api/join-board/${token}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      navigate(`/b/${board.id}/${board.name}`);
    } catch (error) {
      setError(error.response?.data?.message || 'Error joining board');
    }
  };

  if (!board && !error) return <div>Loading...</div>;

  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <h1>Mời bạn tham gia bảng "{board?.name}"</h1>
          <p>Bạn đã được mời tham gia bảng này. Nhấn nút bên dưới để vào bảng!</p>
          <button onClick={handleJoinBoard}>Vào bảng</button>
        </>
      )}
    </div>
  );
};

export default AcceptInvitePage;