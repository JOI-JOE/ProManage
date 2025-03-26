import { createSlice } from "@reduxjs/toolkit";

// Initial state
const initialState = {
  user: [], // Dữ liệu user
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
    setLoading(state, action) {
      state.isLoading = action.payload; // Cập nhật trạng thái loading
    },
    setError(state, action) {
      state.error = action.payload; // Cập nhật lỗi
    },
  },
});

export const { setUser, setWorkspaces, setLoading, setError } =
  userSlice.actions;

export default userSlice.reducer;
