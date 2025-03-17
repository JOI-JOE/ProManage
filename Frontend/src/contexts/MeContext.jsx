import { createContext, useContext } from "react";
import { useUserData } from "../hooks/useUser";

// Tạo Context
const MeContext = createContext();
// Hook custom để dễ dàng sử dụng context
export const useMe = () => useContext(MeContext);

// Provider chính
export const MeProvider = ({ children }) => {

    const { userProfile, userDashboard, isLoading, error } = useUserData();

    if (isLoading) return <p>Đang tải dữ liệu...</p>;
    if (error) return <p>Có lỗi xảy ra!</p>;

    console.log(userProfile)
    console.log(userDashboard)

    return (
        <MeContext.Provider value={{ userProfile, userDashboard }}>
            {children}
        </MeContext.Provider>
    );
};
