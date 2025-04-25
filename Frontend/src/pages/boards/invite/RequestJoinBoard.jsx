import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useRequestJoinBoard } from "../../../hooks/useInviteBoard";
import { Button, Typography, Box } from "@mui/material";
import { useMe } from "../../../contexts/MeContext";

const RequestJoinBoard = () => {
  // const [boardId, setBoardId] = useState("");
  const { boardId } = useParams(); // Lấy boardId từ URL params
  const [message, setMessage] = useState("");
  const [isRequestSent, setIsRequestSent] = useState(false);
  const [boardDetails, setBoardDetails] = useState({ id: null, name: null }); // Lưu board_id và board_name
  const [isMember, setIsMember] = useState(false); // State để kiểm tra nếu đã là thành viên
  // const navigate = useNavigate();
  // const navigate = useNavigate();
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
              setMessage(data.message);
              setIsRequestSent(true);
              setIsMember(false);
            } else {
            // Xử lý các lỗi cụ thể
            if (data.message === "Yêu cầu của bạn đã được gửi trước đó và đang chờ duyệt") {
              setIsRequestSent(true); // Ẩn nút Gửi yêu cầu
              setIsMember(false);
            } else if (data.message === "Bạn đã là thành viên") {
              setIsRequestSent(true); // Ẩn nút Gửi yêu cầu
              setIsMember(true); // Hiển thị nút Đi Tới bảng
              setBoardDetails({ id: data.board_id, name: data.board_name });
            } else {
              setIsRequestSent(false); // Hiển thị nút Gửi yêu cầu
              setIsMember(false);
              setBoardDetails({ id: null, name: null });
            }
            setMessage(data.message);
          }
          },
          onError: (error) => {
            const errorMessage = error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.";
            // Xử lý các lỗi cụ thể
            if (errorMessage === "Yêu cầu của bạn đã được gửi trước đó và đang chờ duyệt") {
              setIsRequestSent(true); // Ẩn nút Gửi yêu cầu
              setIsMember(false);
            } else if (errorMessage === "Bạn đã là thành viên") {
              setIsRequestSent(true); // Ẩn nút Gửi yêu cầu
              setIsMember(true); // Hiển thị nút Đi Tới bảng
              setBoardDetails({
                id: error.response?.data?.board_id,
                name: error.response?.data?.board_name,
              });
            } else {
              setIsRequestSent(false); // Hiển thị nút Gửi yêu cầu
              setIsMember(false);
            }
            setMessage(errorMessage);
          },
        }
      );
    } catch (error) {
      console.error("Có lỗi xảy ra:", error);
      setMessage("Có lỗi xảy ra, vui lòng thử lại.");
      setIsRequestSent(false);
      setIsMember(false);
      setBoardDetails({ id: null, name: null });
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
        ) : isMember ? (
          <Button
            variant="contained"
            color="primary"
            className="w-full py-2"
            component={Link}
            to={`/b/${boardDetails.id}/${encodeURIComponent(boardDetails.name)}`}
            sx={{ textTransform: "none", fontSize: "1rem" }}
          >
            Đi Tới bảng
          </Button>
        ) : null}
      </div>
    </Box>
  );
};

export default RequestJoinBoard;