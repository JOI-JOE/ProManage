import { configureStore } from "@reduxjs/toolkit";
import starredBoardsReducer from "./slices/starredBoardsSlice";
import userReducer from "./slices/userSlice"; // Import userReducer
import boardReducer from "./slices/boardSlice";

const store = configureStore({
  reducer: {
    starredBoards: starredBoardsReducer,
    user: userReducer,
    boards: boardReducer,
  },
  devTools: process.env.NODE_ENV !== "production", // Bật devTools chỉ trong môi trường phát triển
});

export default store;
