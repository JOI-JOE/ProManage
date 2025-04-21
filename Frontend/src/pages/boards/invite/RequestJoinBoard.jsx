// src/pages/boards/RequestJoinBoard.js
import React, { useState } from "react";
import { data, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useRequestJoinBoard } from "../../../hooks/useInviteBoard";
import { Button, Typography, Box } from "@mui/material";
import { useMe } from "../../../contexts/MeContext";

const RequestJoinBoard = () => {
  // const [boardId, setBoardId] = useState("");
  const { boardId } = useParams(); // Lấy boardId từ URL params
  const [message, setMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false); // Theo dõi trạng thái gửi yêu cầu
  const navigate = useNavigate();
  const { user } = useMe()
  const joinBoardMutation = useRequestJoinBoard(); // Sử dụng custom hook

  const handleSubmit = () => {
    // console.log(boardId, user?.id);

    try {
      joinBoardMutation.mutate(
        { boardId, userId: user?.id }, // Truyền dữ liệu trực tiếp
        {
          onSuccess: (data) => {
            if (data.success) {
              setMessage("Yêu cầu tham gia đã được gửi!");
              setIsRequestSent(true); // Cập nhật trạng thái gửi yêu cầu thành công
            } else {
              setMessage("Có lỗi xảy ra, vui lòng thử lại.");
            }
          }
        }
      );
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);

    }

  };

  return (
    <Box className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Typography variant="h5" className="text-center font-bold text-gray-800 mb-4">
          Gửi Yêu Cầu Tham Gia Bảng
        </Typography>
        <Typography variant="body1" className="text-center text-gray-600 mb-6">
          Đây có thể là trang riêng tư. Nếu ai đó đã cung cấp cho bạn liên kết này thì bạn có thể cần phải là thành viên hoặc không gian làm việc để truy cập trang.
        </Typography>

        {isRequestSent ? (
          <Typography variant="body1" className="text-center text-green-500 font-semibold">
            {message}
          </Typography>
        ) : (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="w-full py-2"
            onClick={handleSubmit}
            disabled={joinBoardMutation.isLoading || !boardId}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            {joinBoardMutation.isLoading ? "Đang gửi..." : "Gửi yêu cầu tham gia bảng"}
          </Button>
        )}


      </div>
    </Box>
  );
};

export default RequestJoinBoard;
