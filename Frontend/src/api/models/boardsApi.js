import axios from "axios";
import authClient from "../authClient";

export const getBoardsAll = async () => {
  try {
    const response = await authClient.get("boards");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy workspace của người dùng:", error);
    throw error;
  }
};

export const createBoard = async (data) => {
  try {
    const response = await authClient.post("/createBoard",data);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi tạo bảng:", error);
    throw error;
  }
};


export const getBoardById = async (boardId) => {
  if (!boardId) {
    throw new Error("boardId không hợp lệ");
  }

  try {
    const response = await authClient.get(`/board/${boardId}`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy bảng:", error?.response?.data?.message || error.message);

    throw new Error(
      error?.response?.data?.message || "Không thể lấy dữ liệu bảng, vui lòng thử lại sau."
    );
  }
};


