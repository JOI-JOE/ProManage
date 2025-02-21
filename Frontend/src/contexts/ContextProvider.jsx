import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "../hooks/useUser";

const StateContext = createContext({
    user: null,
    token: null,
    setUser: () => { },
    setToken: () => { },
    isLoading: true,
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

    const { data: fetchedUser, isLoading, error, refetch } = useUser();

    useEffect(() => {
        if (token) {
            refetch();
        } else {
            setUser(null); // Không cần callback form ở đây vì không phụ thuộc vào state trước đó
        }
    }, [token, refetch]);


    useEffect(() => {
        if (!isLoading && fetchedUser) {
            setUser(fetchedUser)
        }
    }, [isLoading, fetchedUser])

    const value = {
        user,
        token,
        setUser,
        setToken,
        isLoading,
        error,
    };

    return (
        <StateContext.Provider value={value}>
            {children}
        </StateContext.Provider>
    );
};

export const useStateContext = () => useContext(StateContext);