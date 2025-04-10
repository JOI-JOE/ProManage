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
        const { user_exists, email } = response.data;
        // console.log('user_exists', user_exists);
        console.log('API response:', { email, user_exists }); // Debug
        
        if (isAuthenticated) {
          navigate(`/accept-invite/${token}`);
        } else {
          if (email) {
            // Mời qua email
            if (user_exists) {
              navigate('/login', { state: { inviteToken: token } });
            } else {
              navigate(`/register?token=${token}&email=${encodeURIComponent(email)}`);
            }
          } else {
            // Link chung
            navigate('/login', { state: { inviteToken: token } });
          }
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