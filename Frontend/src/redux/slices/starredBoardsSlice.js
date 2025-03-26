import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  starred: [], // Mảng danh sách các board đã đánh dấu sao
};

const starredBoardsSlice = createSlice({
  name: "starredBoards",
  initialState,
  reducers: {
    setStarredBoards: (state, action) => {
      state.starred = action.payload; // Cập nhật trực tiếp danh sách board vào state
    },
    starBoard: (state, action) => {
      const { board } = action.payload; // Nhận board từ payload
      const boardIndex = state.starred.board_stars.findIndex(
        (b) => b.board_id === board.board_id
      ); // Kiểm tra board đã có trong danh sách chưa

      if (boardIndex === -1) {
        // Nếu board chưa có trong danh sách starred.board_stars, thêm vào mảng
        state.starred.board_stars.push(board);
      }
    },
    unstarBoard: (state, action) => {
      const { board } = action.payload; // Nhận board từ payload
      const boardIndex = state.starred.board_stars.findIndex(
        (b) => b.board_id === board.board_id
      ); // Kiểm tra board có trong danh sách starred.board_stars không

      if (boardIndex !== -1) {
        // Nếu board đã có trong danh sách, xóa khỏi mảng
        state.starred.board_stars.splice(boardIndex, 1);
      }
    },
  },
});

export const { setStarredBoards, starBoard, unstarBoard } =
  starredBoardsSlice.actions;
export default starredBoardsSlice.reducer;
