import authClient from "../authClient";

export const getListByBoardId = async (boardId) => {
  try {
    if (!boardId) {
      console.error("Lỗi: boardId không được cung cấp.");
      return [];
    }
    const response = await authClient.get(`/lists/${boardId}`);

    return response.data; // Trả về danh sách columns
  } catch (error) {
    console.error(
      `Lỗi khi lấy danh sách các list của board với ID: ${boardId}`,
      error
    );
    return [];
  }
};

export const getListDetail = async (listId) => {
  try {
    const response = await authClient.get(`/lists/${listId}/detail`);
    // console.log("API response:", response); // Kiểm tra toàn bộ response
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
      positions: updatedPositions.map((pos) => ({
        id: pos.id,
        position: pos.position,
      })),
    });

    console.log("✅ Cập nhật vị trí thành công:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Lỗi cập nhật vị trí:",
      error.response?.data || error.message
    );
    throw new Error(
      error.response?.data?.message || "Không thể cập nhật vị trí list"
    );
  }
};

export const createList = async (boardId, listName) => {
  try {
    const response = await authClient.post(
      `/lists/${boardId}`, // Chú ý đường dẫn chứa boardId
      {
        name: listName, // Truyền tên danh sách trong body
      }
    );
    return response.data; // Trả về dữ liệu danh sách mới tạo
  } catch (error) {
    console.error("❌ Lỗi khi tạo danh sách:", error);
    throw error; // Xử lý lỗi nếu có
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
    const response = await authClient.patch(`/lists/${listId}/closed`, {
      closed: closed,
    });
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    throw error; // Xử lý lỗi nếu có
  }
};

export const updateListPosition = async (boardId, updatedLists) => {
  if (!boardId || !Array.isArray(updatedLists) || updatedLists.length === 0) {
    console.error("Dữ liệu đầu vào không hợp lệ.");
    return;
  }

  try {
    const response = await authClient.put(`/boards/update-column-position`, {
      board_id: boardId,
      lists: updatedLists.map(({ id, position }) => ({ id, position })), // Chỉ gửi id và position
    });

    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật vị trí list_board:", error);
    throw error;
  }
};

