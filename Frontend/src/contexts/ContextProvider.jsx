import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "../api/models/userApi";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
    error: null,
});

export const ContextProvider = ({ children }) => {
    const [token, _setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null); // Khai báo user ở đây


    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await getUser(); // Gọi API để lấy thông tin người dùng
                    setUser(userData); // Cập nhật state user
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                    setUser(null); // Đặt lại user thành null nếu có lỗi
                }
            } else {
                setUser(null); // Nếu không có token, đặt lại user thành null
            }
        };

        fetchUser();
    }, [token]);

    const value = {
        user,
        token,
        setUser,
        setToken,
    };

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
