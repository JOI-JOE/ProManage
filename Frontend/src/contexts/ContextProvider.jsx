import { createContext, useContext, useState, useCallback, useMemo } from "react";


const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
});

export const ContextProvider = ({ children }) => {
    const [token, _setToken] = useState(localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [linkInvite, setLinkInvite] = useState(null);

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
        linkInvite,
        setLinkInvite,
    }), [user, token, linkInvite, setToken, setLinkInvite]);

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);