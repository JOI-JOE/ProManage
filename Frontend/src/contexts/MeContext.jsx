import { createContext, useContext, useMemo } from "react";
import { useUserData } from "../hooks/useUser";

// Tạo Context với giá trị mặc định
const MeContext = createContext({
    user: null,
    workspaceId: null,
    boardId: null,
    isLoading: true,
    error: null,
});

// Hook custom để dễ dàng sử dụng context
export const useMe = () => useContext(MeContext);

export const MeProvider = ({ children }) => {
    const { userInfo, isLoading, error } = useUserData();

    // Trích xuất dữ liệu từ userInfo
    const user = userInfo?.user || null;
    const workspaceId = userInfo?.workspaceId || null;
    const boardId = userInfo?.boardId || null;

    // Tối ưu hóa giá trị context bằng useMemo
    const contextValue = useMemo(
        () => ({ user, workspaceId, boardId, isLoading, error }),
        [user, workspaceId, boardId, isLoading, error]
    );

    

    return <MeContext.Provider value={contextValue}>{children}</MeContext.Provider>;
};
