import { createContext, useContext } from "react";
import { useUserData } from "../hooks/useUser";

// Tạo Context
const MeContext = createContext({ user: null, userProfile: null, userDashboard: null });
// Hook custom để dễ dàng sử dụng context
export const useMe = () => useContext(MeContext);

// Provider chính
export const MeProvider = ({ children }) => {

    const { userProfile, userDashboard, isLoading, error } = useUserData();
    const user = userProfile?.user
    return (
        <MeContext.Provider value={{ user, userProfile, userDashboard }}>
            {children}
        </MeContext.Provider>
    );
};
