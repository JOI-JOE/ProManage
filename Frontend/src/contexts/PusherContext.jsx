import React, { createContext, useContext, useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

const PusherContext = createContext(null);

export const PusherProvider = ({ children }) => {
    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        const PUSHER_KEY = import.meta.env.VITE_PUSHER_APP_KEY;
        const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_APP_CLUSTER;
        const PUSHER_SCHEME = import.meta.env.VITE_PUSHER_SCHEME || "https";
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

        if (!PUSHER_KEY || !PUSHER_CLUSTER) {
            console.error("❌ Thiếu cấu hình Pusher trong .env");
            return;
        }

        window.Pusher = Pusher;
        const echo = new Echo({
            broadcaster: "pusher",
            key: PUSHER_KEY,
            cluster: PUSHER_CLUSTER,
            forceTLS: PUSHER_SCHEME === "https",
            wsHost: `ws-${PUSHER_CLUSTER}.pusher.com`,
            wsPort: 80,
            wssPort: 443,
            disableStats: true,
            enabledTransports: ["ws", "wss"],
            authEndpoint: `${BACKEND_URL}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        });

        setEchoInstance(echo);

        return () => {
            echo.disconnect();
        };
    }, []);

    return (
        <PusherContext.Provider value={echoInstance}>
            {children}
        </PusherContext.Provider>
    );
};

export const usePusher = () => {
    return useContext(PusherContext);
};
