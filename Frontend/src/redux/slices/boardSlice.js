import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  boards: [], // Mảng lưu trữ danh sách boards
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: "boards", // Tên của slice
  initialState,
  reducers: {
    // Action để set boards khi tải thành công
    setBoards: (state, action) => {
      state.boards = action.payload;
    },
    // Action để thêm board mới
    addBoard: (state, action) => {
      state.boards.push(action.payload);
    },
    // Action để xóa board
    removeBoard: (state, action) => {
      state.boards = state.boards.filter(
        (board) => board.id !== action.payload
      );
    },
    // Action để cập nhật board
    updateBoard: (state, action) => {
      const index = state.boards.findIndex(
        (board) => board.id === action.payload.id
      );
      if (index !== -1) {
        state.boards[index] = action.payload;
      }
    },
    // Action để set loading trạng thái khi lấy dữ liệu từ API
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    // Action để set lỗi nếu có
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setBoards,
  addBoard,
  removeBoard,
  updateBoard,
  setLoading,
  setError,
} = boardSlice.actions;

export default boardSlice.reducer;
