import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { search } from '../api/models/searchApi';

const useSearch = (query, userId) => {
  const queryClient = useQueryClient();

  // useQuery để lấy kết quả tìm kiếm
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['search', query, userId], // Key duy nhất cho mỗi tìm kiếm
    queryFn: () => search(query, userId), // Dùng hàm bạn đã viết
    enabled: !!query && !!userId, // Chỉ chạy khi có query và userId
    staleTime: 5 * 60 * 1000, // Dữ liệu "tươi" trong 5 phút
  });

  return {
    searchResults: searchResults || {}, // Kết quả tìm kiếm
    isLoading,
    error,
  };
};

export default useSearch;
