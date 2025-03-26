import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  starredBoards: [], // Chỉ lưu ID của board được đánh dấu sao
};

const starredBoardsSlice = createSlice({
  name: "starredBoards",
  initialState,
  reducers: {
    toggleStarBoard: (state, action) => {
      const boardId = action.payload;
      const index = state.starredBoards.indexOf(boardId);

      if (index === -1) {
        state.starredBoards.push(boardId);
      } else {
        state.starredBoards.splice(index, 1);
      }
    },
    setStarredBoards: (state, action) => {
      state.starredBoards = action.payload; // Cập nhật danh sách ID từ API
    },
  },
});

export const { toggleStarBoard, setStarredBoards } = starredBoardsSlice.actions;
export default starredBoardsSlice.reducer;
