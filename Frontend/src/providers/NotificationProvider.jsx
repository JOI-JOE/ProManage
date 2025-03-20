import { createContext, useContext, useEffect, useState } from "react";
// import { echoInstance } from "../lib/echo"; // Đường dẫn echoInstance tùy dự án của bạn

import echoInstance from "../hooks/realtime/useRealtime";
import { useStateContext } from "../contexts/ContextProvider";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { user } = useStateContext();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user?.id || !echoInstance) return;

    const channel = echoInstance.private(`App.Models.User.${user.id}`);
    console.log(`🔔 Listening notifications for user ${user.id}`);

    channel.notification((notification) => {
      console.log("📥 New notification:", notification);
      setNotifications((prev) => [notification, ...prev]);
      // Ở đây bạn có thể show toast luôn nếu muốn
      // toast.info(notification.data.message);
    });

    return () => {
      echoInstance.leaveChannel(`private-App.Models.User.${user.id}`);
      console.log(`👋 Left notification channel for user ${user.id}`);
    };
  }, [user?.id]);

  const clearNotifications = () => setNotifications([]);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within NotificationProvider");
  return context;
};
