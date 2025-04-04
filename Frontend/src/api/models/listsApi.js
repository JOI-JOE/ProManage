import authClient from "../authClient";

export const fetchListByBoardId = async (boardId) => {
  try {
    const response = await authClient.get(`/lists/${boardId}`);
    return response.data;
  } catch (error) {
    console.error(
      "Lỗi khi lấy bảng:",
      error?.response?.data?.message || error.message
    );
    throw new Error(
      error?.response?.data?.message ||
        "Không thể lấy dữ liệu bảng, vui lòng thử lại sau."
    );
  }
};

export const createListAPI = async ({ boardId, name, pos }) => {
  try {
    const response = await authClient.post(`/lists`, {
      boardId,
      name,
      pos,
    });
    if (response.status !== 201 || !response.data?.id) {
      throw new Error("API trả về dữ liệu không hợp lệ");
    }
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo danh sách:", error);
    throw error; // Để mutation xử lý lỗi này
  }
};

/// -----------------------------------------
// Những function update=
export const updateListName = async (listId, newName) => {
  try {
    if (!newName) {
      throw new Error("No name provided to update");
    }

    const response = await authClient.put(`/lists/${listId}`, {
      name: newName,
    });

    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi cập nhật tên danh sách:", error.message || error);
    throw error;
  }
};

export const updateListClosed = async (listId, closed) => {
  try {
    if (closed === undefined) {
      throw new Error("No closed status provided to update");
    }

    const response = await authClient.put(`/lists/${listId}`, {
      closed,
    });

    return response.data;
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật trạng thái đóng danh sách:",
      error.message || error
    );
    throw error;
  }
};

// Update vị trí
export const updatePositionList = async ({ listId, position }) => {
  try {
    const { data } = await authClient.put(`/lists/${listId}`, {
      position,
    });
    return data;
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật vị trí list_board:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// export const getListClosedByBoard = async (boardId) => {
//   try {
//     if (!boardId) {
//       console.error("Lỗi: boardId không được cung cấp.");
//       return [];
//     }
//     const response = await authClient.get(`/lists/${boardId}/listClosed`);

//     return response.data; // Trả về danh sách columns
//   } catch (error) {
//     console.error(
//       `Lỗi khi lấy danh sách các bảng đóng của board với ID: ${boardId}`,
//       error
//     );
//     return [];
//   }
// };

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

// export const deleteList = async (id) => {
//   try {
//     const response = await authClient.delete(`/lists/${id}/destroy`);
//     return response.data;
//   } catch (error) {
//     console.error("Lỗi khi xóa list:", error);
//     throw error;
//   }
// };

// export const getListDetail = async (listId) => {
//   try {
//     const response = await authClient.get(`/lists/${listId}/detail`);
//     // console.log("API response:", response); // Kiểm tra toàn bộ response
//     if (response.data) {
//       return response.data;
//     } else {
//       console.error("No data returned from API.");
//       throw new Error("No data from API.");
//     }
//   } catch (error) {
//     console.error("Error fetching data:", error);
//     throw error;
//   }
// };
