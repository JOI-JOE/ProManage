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

export const getListClosed = async () => {
  try {
    const response = await authClient.get("/lists/listClosed");
    return response.data;
  } catch (error) {
    console.error("Lỗi khi lấy list được lưu trữ:", error);
    throw error;
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

export const createList = async ({ newColumn }) => {
  try {
    // Gọi API để tạo danh sách mới
    const createResponse = await authClient.post(`/lists`, {
      newColumn,
    });

    return createResponse.data;
  } catch (error) {
    console.error("❌ Lỗi khi tạo danh sách:", error);
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
      closed: closed,
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
