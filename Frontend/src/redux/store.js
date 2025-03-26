import { configureStore } from "@reduxjs/toolkit";
import starredBoardsReducer from "./slices/starredBoardsSlice";

const store = configureStore({
  reducer: {
    starredBoards: starredBoardsReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Bật devTools chỉ trong môi trường phát triển
});

export default store;
