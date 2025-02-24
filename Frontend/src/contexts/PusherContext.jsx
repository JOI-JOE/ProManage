import React, { createContext, useContext, useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Tạo context
const PusherContext = createContext(null);

// Provider component
export const PusherProvider = ({ children }) => {
    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        // Lấy cấu hình từ biến môi trường
        const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
        const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER;
        const PUSHER_HOST = import.meta.env.VITE_PUSHER_HOST;
        const PUSHER_PORT = import.meta.env.VITE_PUSHER_PORT;
        const PUSHER_TLS = import.meta.env.VITE_PUSHER_TLS === "true"; // Chuyển đổi sang boolean

        if (!PUSHER_KEY || !PUSHER_CLUSTER || !PUSHER_HOST || !PUSHER_PORT) {
            console.error("❌ Thiếu cấu hình Pusher trong .env");
            return;
        }

        // Khởi tạo Pusher
        const pusherClient = new Pusher(PUSHER_KEY, {
            cluster: PUSHER_CLUSTER,
            forceTLS: PUSHER_TLS,
            encrypted: PUSHER_TLS,
        });

        // Khởi tạo Echo với cấu hình Pusher
        const echo = new Echo({
            broadcaster: "pusher",
            client: pusherClient,
            wsHost: PUSHER_HOST,
            wsPort: Number(PUSHER_PORT),
            wssPort: Number(PUSHER_PORT),
            forceTLS: PUSHER_TLS,
            disableStats: true,
            enabledTransports: ["ws", "wss"],
            auth: {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            },
        });

        // Lưu instance của Echo vào state
        setEchoInstance(echo);

        // Cleanup khi component unmount
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

// Hook để sử dụng Echo
export const usePusher = () => {
    const echoInstance = useContext(PusherContext);

    if (!echoInstance) {
        console.warn("⚠️ Pusher chưa được khởi tạo.");
    }

    return echoInstance;
};
