import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('token');

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/invite-board/${token}`);
        const { board } = response.data;

        if (isAuthenticated) {
          // Nếu đã đăng nhập, chuyển thẳng tới trang accept-invite
          navigate(`/accept-invite/${token}`);
        } else {
          // Nếu chưa đăng nhập, chuyển tới login và lưu token
          navigate('/login', { state: { inviteToken: token } });
        }
      } catch (error) {
        console.error('Invalid invite link', error);
        navigate('/404');
      }
    };

    checkInvite();
  }, [token, isAuthenticated, navigate]);

  return <div>Loading...</div>; // Hiển thị tạm thời trong khi kiểm tra
};

export default InvitePage;