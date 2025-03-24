import { createContext, useContext, useMemo } from "react";
import { useUserOverviewData } from "../hooks/useUser";

// Tạo Context với giá trị mặc định
const MeContext = createContext({
    user: null,
    userProfile: null,
    userDashboard: null,
    isLoading: true,
    error: null,
});

// Hook custom để dễ dàng sử dụng context
export const useMe = () => useContext(MeContext);

export const MeProvider = ({ children }) => {
    const { userProfile, userDashboard, isLoading, error } = useUserOverviewData();
    const user = userProfile?.user;

    // Tối ưu hóa giá trị context bằng useMemo
    const contextValue = useMemo(
        () => ({
            user,
            userProfile,
            userDashboard,
            isLoading,
            error,
        }),
        [user, userProfile, userDashboard, isLoading, error]
    );

    return (
        <MeContext.Provider value={contextValue}>
            {children}
        </MeContext.Provider>
    );
};
