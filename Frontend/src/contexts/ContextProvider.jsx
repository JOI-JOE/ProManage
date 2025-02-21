import { createContext, useContext, useState } from "react";

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