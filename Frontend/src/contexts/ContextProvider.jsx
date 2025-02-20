import { createContext, useContext, useState, useEffect } from "react";
import Authen from "../Apis/Authen";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
});

export const ContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, _setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));

    const setToken = (token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("ACCESS_TOKEN", token);
        } else {
            localStorage.removeItem("ACCESS_TOKEN");
        }
    };

    // 🛠 Gọi API để lấy thông tin user nếu có token
    useEffect(() => {
        if (token) {
            console.log("🔄 Gọi API lấy user...");
            Authen
                .get("/user")
                .then((response) => {
                    console.log("✅ Dữ liệu user nhận được:", response.data);
                    setUser(response.data.user);
                })
                .catch((error) => console.error("❌ Lỗi khi lấy user:", error));
        }
    }, [token]);

    return (
        <StateContext.Provider value={{ user, token, setUser, setToken }}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);
