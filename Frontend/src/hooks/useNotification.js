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
// // Lắng nghe thông báo real-time từ Pusher
// useEffect(() => {
//   if (!userId) return;

//   const channel = echoInstance.private(`App.Models.User.${userId}`);
//   channel.notification((newNotification) => {
//     console.log('New Notification:', newNotification);
//     // Cập nhật danh sách thông báo trong cache của React Query
//     queryClient.setQueryData(['notifications', userId], (oldData) => {
//       if (!oldData) return [newNotification];
//       return [newNotification, ...oldData];
//     });
//   });

//   // Cleanup khi component unmount
//   return () => {
//     echoInstance.leave(`App.Models.User.${userId}`);
//   };
// }, [userId, queryClient]);

  return {
    notifications: notifications || [], // Danh sách thông báo
    isLoading,
    error,
  };
};

export default useNotifications;