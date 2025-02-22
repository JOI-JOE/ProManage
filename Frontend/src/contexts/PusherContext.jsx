import React, { createContext, useContext, useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Tạo context
const PusherContext = createContext(null);

// Provider component
export const PusherProvider = ({ children }) => {
    const [echoInstance, setEchoInstance] = useState(null);

    useEffect(() => {
        // Khởi tạo Pusher với key và cluster
        const pusherClient = new Pusher("526535f4e858cf0c70e9", {
            cluster: "ap1",
            forceTLS: true,
            encrypted: true,
        });

        // Khởi tạo Echo với cấu hình Pusher
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

        // Lưu instance của Echo vào state
        setEchoInstance(echo);

        // Dọn dẹp khi component unmount
        return () => {
            echo.disconnect(); // Ngắt kết nối khi unmount
        };
    }, []);

    // Cung cấp echoInstance cho các component con
    return (
        <PusherContext.Provider value={echoInstance}>
            {children}
        </PusherContext.Provider>
    );
};

// Hook để sử dụng echoInstance
export const usePusher = () => {
    const echoInstance = useContext(PusherContext);

    // Kiểm tra xem echoInstance có tồn tại không
    if (!echoInstance) {
        console.warn("⚠️ echoInstance chưa được khởi tạo.");
    }

    return echoInstance;
};