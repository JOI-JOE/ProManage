// src/api/tableView.ts

import authClient from "../authClient"


export const getTableView = async (boardIds = []) => {
    try {
        // Gửi boardIds qua query parameters
        const response = await authClient.post('/table-view', {
            boardIds
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu Table View:', error.response?.data?.message || error.message);
        throw error;
    }
};
export const getListByBoard = async (boardIds = []) => {
    try {
        // Gửi boardIds qua query parameters
        const response = await authClient.post('/lists/by-boards', {
            boardIds
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu List', error.response?.data?.message || error.message);
        throw error;
    }
};
export const UpdateCardByList = async (cardId, listBoardId) => {
 

    try {
        
        // Gửi boardIds qua query parameters
        const response = await authClient.put(`/cards/${cardId}/list`, {
            listBoardId
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu Table View:', error.response?.data?.message || error.message);
        throw error;
    }
};
export const getMemberByBoard = async (boardIds = []) => {
    try {
        // Gửi boardIds qua query parameters
        const response = await authClient.post('/table-view/board-members', {
            boardIds
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu List', error.response?.data?.message || error.message);
        throw error;
    }
};
export const addMemberIncardView = async (cardId,memberId) => {
    console.log(cardId);
    console.log(memberId);
    try {
        // Gửi boardIds qua query parameters
        const response = await authClient.post(`/cards/${cardId}/table-view-member`, {
             member_id: memberId 
        });
        return response.data;
    } catch (error) {
        console.error('Lỗi khi thêm thành viên', error.response?.data?.message || error.message);
        throw error;
    }
};
export const RemoveMember = async (cardId,memberId) => {
    try {
        // Gửi boardIds qua query parameters
        const response = await authClient.delete(`/cards/${cardId}/members/${memberId}`);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi xóa thành viên', error.response?.data?.message || error.message);
        throw error;
    }
};
export const updateDueDate = async (card_id, { end_date, end_time, reminder }) => {
    console.log("updateDueDate:", { card_id, end_date, end_time, reminder });
    if (!card_id) {
        throw new Error("cardId is required");
    }
    try {
        const response = await authClient.put(`/cards/${card_id}/table-view-date`, {
            end_date,
            end_time,
            reminder,
        });
        console.log("updateDueDate response:", response.data);
        return response.data;
    } catch (error) {
        console.error('Lỗi khi cập nhật ngày:', error.response?.data?.message || error.message);
        throw error;
    }
};
