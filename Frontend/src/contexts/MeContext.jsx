import { createContext, useContext } from "react";
import { useUserBoards, useUserBoardsWithWorkspaces, useUserWorkspaces } from "../hooks/useUser";

// Tạo Context
const MeContext = createContext();
// Hook custom để dễ dàng sử dụng context
export const useMe = () => useContext(MeContext);

// Provider chính
export const MeProvider = ({ children }) => {
    // Gọi API thông qua React Query hooks
    const { data: workspaces, isLoading: loadingWorkspaces, error: errorWorkspaces } = useUserWorkspaces();
    const { data: boardsWithWorkspaces, isLoading: loadingBoardsWithWorkspaces, error: errorBoardsWithWorkspaces } = useUserBoardsWithWorkspaces();
    const { data: boards, isLoading: loadingBoards, error: errorBoards } = useUserBoards();

    // Kiểm tra trạng thái tải dữ liệu
    const isLoading = loadingWorkspaces || loadingBoardsWithWorkspaces || loadingBoards;
    const hasError = errorWorkspaces || errorBoardsWithWorkspaces || errorBoards;

    console.log(workspaces)
    console.log(boardsWithWorkspaces)
    console.log(boards)
    return (
        <MeContext.Provider value={{ workspaces, boardsWithWorkspaces, boards, isLoading, hasError }}>
            {children}
        </MeContext.Provider>
    );
};
