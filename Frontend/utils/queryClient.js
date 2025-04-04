// import { QueryClient } from "@tanstack/react-query";
// import { persistQueryClient } from "@tanstack/react-query-persist-client";
// import { createIDBPersister } from "@tanstack/react-query-persist-client-idb";

// // 1️⃣ Tạo Query Client
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 1000 * 60 * 5, // 5 phút
//       cacheTime: 1000 * 60 * 10, // 10 phút
//       refetchOnWindowFocus: false, // Không gọi API lại khi chuyển tab
//     },
//   },
// });

// //  Tạo IDB Persister (lưu vào IndexedDB)
// const persister = createIDBPersister();

// persistQueryClient({
//   queryClient,
//   persister,
//   maxAge: 1000 * 60 * 60 * 24,
// });
