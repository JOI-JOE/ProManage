import authClient from "../authClient";

export const getListByBoardId = async (boardId) => {
  try {
    if (!boardId) {
      console.error("Lỗi: boardId không được cung cấp.");
      return { data: [], error: "missing_board_id" };
    }

    const response = await authClient.get(`/lists/${boardId}`);
    return { data: response.data, error: null };
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách các list của board với ID: ${boardId}`,
      error
    );

    if (error.response) {
      const status = error.response.status;

      if (status === 403) {
        console.error("Lỗi 403: Người dùng không có quyền truy cập board này.");
        return { data: [], error: "no_access" };
      }

      if (status === 404) {
        console.error("Lỗi 404: Không tìm thấy board hoặc danh sách.");
        return { data: [], error: "not_found" };
      }
    }

    console.error("Lỗi không xác định:", error);
    return { data: [], error: "unknown_error" };
  }
};

export const getListClosedByBoard = async (boardId) => {
  try {
    if (!boardId) {
      console.error("Lỗi: boardId không được cung cấp.");
      return [];
    }
    const response = await authClient.get(`/lists/${boardId}/listClosed`);

    return response.data; // Trả về danh sách columns
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách các bảng đóng của board với ID: ${boardId}`,
      error
    );
    return [];
  }
};

export const deleteList = async (id) => {
  try {
    const response = await authClient.delete(`/lists/${id}/destroy`);
    return response.data;
  } catch (error) {
    console.error("Lỗi khi xóa list:", error);
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
    const response = await authClient.patch(`/lists/${listId}/closed`, {
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    throw error; // Xử lý lỗi nếu có
  }
};

export const updateColPosition = async ({ columns }) => {
  try {
    const response = await authClient.put(`/boards/update-column-position`, {
      columns,
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật vị trí list_board:", error);
    throw error;
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

