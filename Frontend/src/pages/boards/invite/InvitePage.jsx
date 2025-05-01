import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import LogoLoading from "../../../components/Common/LogoLoading";

const InvitePage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem("token");

  useEffect(() => {
    const checkInvite = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/invite-board/${token}`
        );
        const { user_exists, email } = response.data;
        console.log("API response:", { email, user_exists }); // Debug

        if (isAuthenticated) {
          navigate(`/accept-invite/${token}`);
        } else {
          if (email) {
            // Nếu có email
            console.log("Lời mời qua email");

            if (user_exists) {
              console.log("Email đã có tài khoản, tự động đăng nhập");

              try {
                // 📌 Gọi API login bằng email (giả định có 1 API login theo email)
                const loginResponse = await axios.post(
                  "http://localhost:8000/api/auto-login-invite",
                  {
                    email: email,
                    token_invite: token,
                  }
                );
                console.log("Đăng nhập thành công", loginResponse.data);
                const accessToken = loginResponse.data.token;
               
                if (accessToken) {
                  localStorage.setItem('token', accessToken);
                  navigate(`/accept-invite/${token}`);
                } else {
                  console.error('Không nhận được token');
                  navigate('/login');
                }

                // navigate(`/accept-invite/${token}`);
              } catch (loginError) {
                console.error("Tự động đăng nhập thất bại", loginError);
                navigate("/login");
              }
            } else {
              console.log("Email chưa có tài khoản, chuyển tới đăng ký");
              navigate(
                `/register?token=${token}&email=${encodeURIComponent(email)}`
              );
            }
          } else {
            // Nếu không có email (link chung)
            navigate(`/accept-invite/${token}`);
          }
        }
      } catch (error) {
        console.error("Invalid invite link", error);
        navigate("/404");
      }
    };

    checkInvite();
  }, [token, isAuthenticated, navigate]);

  return <LogoLoading />; // Hiển thị tạm thời trong khi kiểm tra
};

export default InvitePage;
