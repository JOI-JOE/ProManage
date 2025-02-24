import authClient from "../authClient";

export const getListByBoardId = async (boardId) => {
    try {
        const response = await authClient.get(`/lists/${boardId}`);

        // Kiểm tra nếu response.data là một mảng và sắp xếp theo position
        if (Array.isArray(response.data)) {
            return response.data.sort((a, b) => a.position - b.position);
        } else {
            console.error("Lỗi: API không trả về danh sách đúng", response.data);
            return []; // Trả về mảng rỗng nếu dữ liệu không hợp lệ
        }
    } catch (error) {
        console.error("Lỗi khi lấy danh sách các list của board:", error);
        throw error;
    }
};

export const getListDetail = async (listId) => {
    try {
        const response = await authClient.get(`/lists/${listId}/detail`);
        console.log("API response:", response); // Kiểm tra toàn bộ response
        if (response.data) {
            return response.data;
        } else {
            console.error("No data returned from API.");
            throw new Error("No data from API.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
};



export const updateListPositions = async ({ boardId, updatedPositions }) => {
    try {
        const response = await authClient.put(`/lists/reorder`, {
            board_id: boardId,
            positions: updatedPositions,  // Đảm bảo positions không phải undefined
        });

        console.log("✅ Cập nhật vị trí thành công:", response.data);
        return response.data;
    } catch (error) {
        console.error("❌ Lỗi cập nhật vị trí:", error);
        throw error;
    }
};


export const createList = async (boardId, listName) => {
    try {
        const response = await authClient.post(
            `/lists/${boardId}`, // Chú ý đường dẫn chứa boardId
            {
                name: listName,  // Truyền tên danh sách trong body
            }
        );
        return response.data;  // Trả về dữ liệu danh sách mới tạo
    } catch (error) {
        console.error("❌ Lỗi khi tạo danh sách:", error);
        throw error;  // Xử lý lỗi nếu có
    }
};


//   export const updateListName = async (boardId, listId, newName) => {
//     try {
//       const response = await authClient.patch(
//         `/lists/${listId}/updateName`, // Đường dẫn API cập nhật tên danh sách
//         {
//           name: newName, // Gửi tên danh sách mới trong body
//         }
//       );
//       return response.data; // Trả về dữ liệu danh sách đã được cập nhật
//     } catch (error) {
//       console.error("❌ Lỗi khi cập nhật tên danh sách:", error);
//       throw error; // Xử lý lỗi nếu có
//     }
//   };

export const updateListName = async (listId, newName) => {
    try {
        const response = await authClient.patch(
            `/lists/${listId}/updateName`, // Đường dẫn API cập nhật tên danh sách
            {
                name: newName, // Gửi tên danh sách mới trong body
            }
        );
        return response.data; // Trả về dữ liệu danh sách đã được cập nhật
    } catch (error) {
        console.error("❌ Lỗi khi cập nhật tên danh sách:", error);
        throw error; // Xử lý lỗi nếu có
    }
};

export const updateClosed = async (listId) => {
    try {
        const response = await authClient.patch(`/lists/${listId}/closed`,{
            closed: closed,
        });
        return response.data;
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
        throw error;  // Xử lý lỗi nếu có
    }
};
