import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { getUser } from "../api/models/userApi";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
});

export const ContextProvider = ({ children }) => {
    const [token, _setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const isFirstRender = useRef(true);
    // Sử dụng useCallback để tránh tạo lại hàm setToken
    const setToken = useCallback((token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, []);


    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return; // Không chạy lần đầu tiên
        }

        const fetchUser = async () => {
            if (token) {
                try {
                    const userData = await getUser();
                    setUser(userData);
                } catch (error) {
                    console.error("Lỗi khi lấy thông tin người dùng:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
        };

        fetchUser();
    }, [token]);


    // Sử dụng useMemo để tránh tạo lại object value mỗi lần component re-render
    const value = useMemo(() => ({
        user,
        token,
        setUser,
        setToken,
    }), [user, token, setToken]);


    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);