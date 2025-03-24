import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  starredBoards: [],
};

const starredBoardsSlice = createSlice({
  name: "starredBoards",
  initialState,
  reducers: {
    toggleStarBoard: (state, action) => {
      const boardId = action.payload;
      if (state.starredBoards.includes(boardId)) {
        state.starredBoards = state.starredBoards.filter(
          (id) => id !== boardId
        );
      } else {
        state.starredBoards.push(boardId);
      }
    },
    setStarredBoards: (state, action) => {
      state.starredBoards = action.payload;
    },
  },
});

export const { toggleStarBoard, setStarredBoards } = starredBoardsSlice.actions;
export default starredBoardsSlice.reducer;
