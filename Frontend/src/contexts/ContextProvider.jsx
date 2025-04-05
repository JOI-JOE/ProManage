import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { }, 
    setToken: () => { },
});

export const ContextProvider = ({ children }) => {
    const [token, _setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);

    const setToken = useCallback((token) => {
        _setToken(token);
        if (token) {
            localStorage.setItem("token", token);
        } else {
            localStorage.removeItem("token");
        }
    }, []);
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