import React, { createContext, useContext, useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Tạo context
const PusherContext = createContext(null);

// Provider component
export const PusherProvider = ({ children }) => {
    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        const pusherClient = new Pusher("526535f4e858cf0c70e9", {
            cluster: "ap1",
            forceTLS: true,
            encrypted: true,
        });

        const echo = new Echo({
            broadcaster: "pusher",
            client: pusherClient,
            wsHost: "ws-ap1.pusher.com",
            wsPort: 6001,
            wssPort: 6001,
            forceTLS: false,
            disableStats: true,
            enabledTransports: ["ws", "wss"],
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        });

        setEchoInstance(echo);

        return () => {
            echo.disconnect(); // Ngắt kết nối khi unmount
        };
    }, []);

    return (
        <PusherContext.Provider value={echoInstance}>
            {children}
        </PusherContext.Provider>
    );
};

// Hook để sử dụng echoInstance
export const usePusher = () => {
    return useContext(PusherContext);
};