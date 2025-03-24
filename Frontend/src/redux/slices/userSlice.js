import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: null, // Dữ liệu user
  boardId: [], // Mảng chứa boardId
  workspaceId: [], // Mảng chứa workspaceId
  workspaces: [], // Dữ liệu workspaces
  isLoading: false, // Trạng thái loading
  error: null, // Trạng thái lỗi
};

// Slice để quản lý dữ liệu người dùng và các thông tin liên quan
const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload; // Cập nhật thông tin user
    },
    setWorkspaces(state, action) {
      state.workspaces = action.payload; // Cập nhật workspaces
    },
    setWorkspaceId(state, action) {
      state.workspaceId = action.payload; // Cập nhật workspaceId
    },
    setBoardId(state, action) {
      state.boardId = action.payload; // Cập nhật boardId
    },
    setLoading(state, action) {
      state.isLoading = action.payload; // Cập nhật trạng thái loading
    },
    setError(state, action) {
      state.error = action.payload; // Cập nhật lỗi
    },
  },
});

export const {
  setUser,
  setWorkspaces,
  setWorkspaceId,
  setBoardId,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
