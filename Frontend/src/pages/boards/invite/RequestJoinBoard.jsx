import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRequestJoinBoard } from "../../../hooks/useInviteBoard";
import { useUser } from "../../../hooks/useUser";
import { Button, Typography, Box } from "@mui/material";

const RequestJoinBoard = () => {
  const { boardId } = useParams();
  const [message, setMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const navigate = useNavigate();
  const { data: user } = useUser();
  const joinBoardMutation = useRequestJoinBoard();
  
  const handleSubmit = () => {
    try {
      joinBoardMutation.mutate(
        { boardId, userId: user?.id },
        {
          onSuccess: (data) => {
            if (data.success) {
              setMessage(data.message);
              setIsRequestSent(true);
            } else {
              setMessage(data.message);
              setIsRequestSent(false);
            }
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
            setMessage(errorMessage);
            setIsRequestSent(false);
          },
        }
      );
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
      setIsRequestSent(false);
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

        {message && (
          <Typography
            variant="body1"
            className={`text-center font-semibold mb-4 ${
              joinBoardMutation.isError || (joinBoardMutation.isSuccess && !joinBoardMutation.data?.success)
                ? "text-red-500"
                : "text-green-500"
            }`}
          >
            {message}
          </Typography>
        )}

        {!isRequestSent ? (
          <Button
            type="submit"
            variant="contained"
            color="primary"
            className="w-full py-2"
            onClick={handleSubmit}
            disabled={joinBoardMutation.isLoading || !boardId || !user?.id}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            {joinBoardMutation.isLoading ? "Đang gửi..." : "Gửi yêu cầu tham gia bảng"}
          </Button>
        ) : null}
      </div>
    </Box>
  );
};

export default RequestJoinBoard;