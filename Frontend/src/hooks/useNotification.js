import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getNotifications } from '../api/models/notificationsApi';
import echoInstance from './realtime/useRealtime';


const useNotifications = (userId) => {
  const queryClient = useQueryClient();

  // useQuery để lấy danh sách thông báo
  const { data: notifications, isLoading, error } = useQuery({
    queryKey: ['notifications', userId], // Key duy nhất cho mỗi user
    queryFn: getNotifications, // Dùng hàm bạn đã viết
    enabled: !!userId, // Chỉ chạy khi có userId
    staleTime: 5 * 60 * 1000, // Dữ liệu "tươi" trong 5 phút
  });

  useEffect(() => {
    if (!userId || !echoInstance) return;
  
    const channel = echoInstance.private(`App.Models.User.${userId}`);
    
    channel.notification((notification) => {
      // console.log("📥 New notification: ", notification);
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    });
  
    return () => {
      echoInstance.leave(`private-App.Models.User.${userId}`);
    };
  }, [userId, queryClient]);


  return {
    notifications: notifications || [], // Danh sách thông báo
    isLoading,
    error,
  };
};

export default useNotifications;