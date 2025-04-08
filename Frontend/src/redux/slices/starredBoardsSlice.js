import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  starred: [],
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
      );

      if (boardIndex === -1) {
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
    updateStarredBoard: (state, action) => {
      const { boardId, newStarId } = action.payload;
      const board = state.starred.board_stars.find(
        (b) => b.board_id === boardId
      );
      if (board) {
        board.star_id = newStarId;
      }
    },
  },
});

export const { setStarredBoards, starBoard, unstarBoard, updateStarredBoard } =
  starredBoardsSlice.actions;
export default starredBoardsSlice.reducer;
