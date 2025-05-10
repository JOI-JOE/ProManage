import authClient from "../authClient";

export const getListByBoardId = async (boardId) => {
  try {
    if (!boardId) {
      // console.error("Lỗi: boardId không được cung cấp.");
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

export const checkBoardAccess = async (boardId) => {
  try {
    const response = await authClient.get(`/check-board/${boardId}`);
    return { data: response.data, error: null };
  } catch (error) {
    const status = error.response?.status;
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    console.log(`checkBoardAccess: Response lỗi ${status || 'N/A'} -`, {
      error: errorMessage,
      boardId,
      response: error.response?.data,
      status,
    });
    if (status === 401) {
      return {
        data: null,
        error: 'unauthenticated',
        message: errorMessage,
        boardId,
      };
    }
    if (status === 403) {
      return {
        data: null,
        error: 'no_access',
        message: errorMessage,
        boardId,
      };
    }
    if (status === 404) {
      return {
        data: null,
        error: 'not_found',
        message: errorMessage,
        boardId,
      };
    }
    if (status === 500) {
      return {
        data: null,
        error: 'server_error',
        message: errorMessage,
        boardId,
      };
    }
    return {
      data: null,
      error: 'unknown_error',
      message: errorMessage,
      boardId,
    };
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
    const response = await authClient.patch(`/lists/${listId}/closed`, {});
    return response.data;
  } catch (error) {
    console.error("Lỗi khi cập nhật trạng thái lưu trữ:", error);
    throw error; // Xử lý lỗi nếu có
  }
};

export const duplicateList = async (listId, name = null) => {
  try {
    const response = await authClient.post(`/lists/${listId}/duplicate`, {
      name, // optional, nếu không có sẽ tự thêm "(Copy)" trong backend
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi sao chép danh sách:", error);
    throw error;
  }
};

export const updatePositionList = async ({ listId, position }) => {
  try {
    const { data } = await authClient.put(`/lists/${listId}`, { position });
    return data;
  } catch (error) {
    console.error(
      "❌ Lỗi khi cập nhật vị trí list_board:",
      error.response?.data || error.message
    );
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
