import React, { useEffect, useState } from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tooltip, IconButton, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import { useGetWorkspaceByName } from "../../../../../hooks/useWorkspace";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import viLocale from '@fullcalendar/core/locales/vi';
import { useAddMemberByCard, useDeleteMemberIncard, useListByBoard, useMemberByBoard, useTableView, useUpdateCardByList, useUpdateDueDate } from "../../../../../hooks/useTableView";
import CheckIcon from "@mui/icons-material/Check";
import { useToggleCardCompletion, useUpdateCardTitle } from "../../../../../hooks/useCard";
import ListSelector from "./details/ListSelector";
import MemberSelector from "./details/MemberSelector";
import DateSelector from "./details/DateSelector";
import LabelList from "./details/LabelList"; // Import LabelList
import EditIcon from "@mui/icons-material/Edit";

const TableView = () => {
    const queryClient = useQueryClient();
    const { workspaceName } = useParams();
    const { data, isLoading, error } = useGetWorkspaceByName(workspaceName);
    const { mutate: toggleCardCompletion } = useToggleCardCompletion();
    const { mutate: updateCardList } = useUpdateCardByList();
    const { mutate: addCardMember } = useAddMemberByCard();
    const { mutate: removeCardMember } = useDeleteMemberIncard();
    const { mutate: updateDate } = useUpdateDueDate();
    const { mutate: updateCardTitle } = useUpdateCardTitle();

    const boardIds = data?.boards?.map(board => board.id);
    const { data: TableView = [] } = useTableView(boardIds);
    const { data: boardLists = [] } = useListByBoard(boardIds);
    const [tableData, setTableData] = useState([]);
    const boardIdsForMembers = tableData.map(row => row.board_id);
    const { data: allBoardMembers = [] } = useMemberByBoard(boardIdsForMembers);
    const [editState, setEditState] = useState({});

    // State để quản lý dialog LabelList
    const [openLabelDialog, setOpenLabelDialog] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    useEffect(() => {
        if (TableView?.length) {
            setTableData(TableView);
            // Đồng bộ editState với TableView
            setEditState((prev) => {
                const newEditState = { ...prev };
                TableView.forEach((row) => {
                    if (!newEditState[row.card_id]) {
                        // Nếu thẻ chưa có trong editState, khởi tạo
                        newEditState[row.card_id] = {
                            isEditing: false,
                            tempTitle: row.card_title,
                        };
                    } else {
                        // Nếu thẻ đã có trong editState, đồng bộ tempTitle nếu không đang chỉnh sửa
                        if (!newEditState[row.card_id].isEditing) {
                            newEditState[row.card_id].tempTitle = row.card_title;
                        }
                    }
                });
                // Xóa các thẻ không còn trong TableView
                Object.keys(newEditState).forEach((cardId) => {
                    if (!TableView.some((row) => row.card_id === cardId)) {
                        delete newEditState[cardId];
                    }
                });
                return newEditState;
            });
        }
    }, [TableView]);

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = dayjs(dateString);
        return `${date.date()} tháng ${date.month() + 1}`;
    };

    const toggleComplete = (cardId, currentStatus) => {
        setTableData(prev =>
            prev.map(card =>
                card.card_id === cardId ? { ...card, is_completed: !currentStatus } : card
            )
        );
        toggleCardCompletion(
            cardId,
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
                },
                onError: (error) => {
                    setTableData(prev =>
                        prev.map(card =>
                            card.card_id === cardId ? { ...card, is_completed: currentStatus } : card
                        )
                    );
                    toast.error(error.response?.data?.message || "Không thể cập nhật hoàn thành");
                }
            }
        );
    };

    const handleListChange = (cardId, newListId) => {
        const newList = boardLists.find(list => list.id === newListId);
        if (!newList) return;

        setTableData(prev =>
            prev.map(card =>
                card.card_id === cardId ? { ...card, list_board_id: newListId, list_name: newList.name } : card
            )
        );

        updateCardList(
            { cardId, listBoardId: newListId },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
                },
                onError: (error) => {
                    setTableData(prev =>
                        prev.map(card =>
                            card.card_id === cardId
                                ? { ...card, list_board_id: TableView.find(c => c.card_id === cardId)?.list_board_id, list_name: TableView.find(c => c.card_id === cardId)?.list_name }
                                : card
                        )
                    );
                    toast.error(error.response?.data?.message || "Không thể cập nhật danh sách");
                }
            }
        );
    };

    const handleToggleMember = (member, cardId) => {
        console.log("handleToggleMember:", { member, cardId });
        if (!cardId) {
            console.error("cardId is undefined");
            toast.error("Không tìm thấy ID thẻ");
            return;
        }

        const rowIndex = tableData.findIndex(row => row.card_id === cardId);
        if (rowIndex === -1) {
            console.error("Card not found for cardId:", cardId);
            toast.error("Không tìm thấy thẻ");
            return;
        }

        const row = tableData[rowIndex];
        const isMemberInCard = (row.members || []).some(m => m.id === member.id);

        const previousTableData = [...tableData];

        if (isMemberInCard) {
            const updatedMembers = (row.members || []).filter(m => m.id !== member.id);
            const updatedTableData = [...tableData];
            updatedTableData[rowIndex] = { ...row, members: updatedMembers };
            setTableData(updatedTableData);

            removeCardMember(
                { cardId, memberId: member.id },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
                    },
                    onError: (error) => {
                        setTableData(previousTableData);
                        toast.error(error.response?.data?.message || "Không thể xóa thành viên");
                    },
                }
            );
        } else {
            const updatedMembers = [...(row.members || []), {
                id: member.id,
                full_name: member.full_name
            }];
            const updatedTableData = [...tableData];
            updatedTableData[rowIndex] = { ...row, members: updatedMembers };
            setTableData(updatedTableData);

            addCardMember(
                { cardId, memberId: member.id },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
                    },
                    onError: (error) => {
                        setTableData(previousTableData);
                        toast.error(error.response?.data?.message || "Không thể thêm thành viên");
                    },
                }
            );
        }
    };

    const handleUpdateDate = ({ card_id, end_date, end_time, reminder }) => {
        console.log("handleUpdateDate called with:", { card_id, end_date, end_time, reminder });

        const rowIndex = tableData.findIndex(row => row.card_id === card_id);
        if (rowIndex === -1) {
            console.error("Card not found for card_id:", card_id);
            toast.error("Không tìm thấy thẻ");
            return;
        }

        const previousTableData = [...tableData];

        const updatedTableData = [...tableData];
        updatedTableData[rowIndex] = {
            ...updatedTableData[rowIndex],
            end_date,
            end_time,
            reminder,
        };
        setTableData(updatedTableData);

        console.log("Calling updateDate with:", { card_id, end_date, end_time, reminder });
        updateDate(
            {
                card_id,
                end_date,
                end_time,
                reminder,
            },
            {
                onSuccess: () => {
                    console.log("updateDate API call succeeded");
                    queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });
                },
                onError: (error) => {
                    console.error("updateDate API call failed:", error);
                    setTableData(previousTableData);
                    toast.error(error.response?.data?.message || "Không thể cập nhật ngày");
                },
            }
        );
    };

    // Hàm mở dialog LabelList
    const handleOpenLabelDialog = (card) => {
        setSelectedCard(card);
        setOpenLabelDialog(true);
    };

    const handleCloseLabelDialog = () => {
        setOpenLabelDialog(false);
        setSelectedCard(null);
    };
    const handleUpdateTitle = (cardId, newTitle, oldTitle) => {
        if (newTitle === oldTitle || !newTitle.trim()) {
            setEditState((prev) => ({
                ...prev,
                [cardId]: { ...prev[cardId], isEditing: false, tempTitle: oldTitle },
            }));
            return;
        }
        // Đặt isEditing về false ngay lập tức để chuyển về chế độ hiển thị
        setEditState((prev) => ({
            ...prev,
            [cardId]: {
                ...prev[cardId],
                isEditing: false,
                isUpdating: true, // Hiển thị loading trong khi API chạy
                hasSaved: true, // Đánh dấu đã lưu để ngăn onBlur
            },
        }));
        setTableData((prev) =>
            prev.map((card) =>
                card.card_id === cardId ? { ...card, card_title: newTitle } : card
            )
        );

        updateCardTitle(
            { cardId, title: newTitle },
            {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ["table-view", boardIds] });

                },
                onError: (error) => {
                    setTableData((prev) =>
                        prev.map((card) =>
                            card.card_id === cardId ? { ...card, card_title: oldTitle } : card
                        )
                    );
                    setEditState((prev) => ({
                        ...prev,
                        [cardId]: { ...prev[cardId], isEditing: false, tempTitle: oldTitle },
                    }));
                    toast.error(error.response?.data?.message || "Không thể cập nhật tiêu đề");
                },
            }
        );
    };

    return (
        <Box
            sx={{
                padding: "32px",
                height: (theme) =>
                    `calc(${theme.trello.boardContentHeight} + ${theme.trello.boardBarHeight})`,
                overflow: "auto",
                fontSize: "0.7rem",
                position: "relative",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Box sx={{ fontSize: "1.5rem", fontWeight: "bold" }}>Bảng</Box>
            </Box>

            <TableContainer component={Paper} sx={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)" }}>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: "#f4f5f7" }}>
                            <TableCell>Thẻ</TableCell>
                            <TableCell>Danh sách</TableCell>
                            <TableCell>Nhãn</TableCell>
                            <TableCell>Thành viên</TableCell>
                            <TableCell>Ngày hết hạn</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row) => {
                            // console.log(row);
                            const boardMembers = allBoardMembers.find(item =>
                                item.board_id === row.board_id)?.members || [];
                            const cardEditState = editState[row.card_id] || {
                                isEditing: false,
                                tempTitle: row.card_title,
                            };
                            return (
                                <TableRow key={row.card_id} sx={{ borderBottom: "1px solid #e0e0e0" }}>
                                    <TableCell sx={{ display: "flex", alignItems: "center" }}>
                                        <Box
                                            onClick={() => toggleComplete(row.card_id, row.is_completed)}
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: "50%",
                                                border: "2px solid",
                                                borderColor: row.is_completed ? "#61bd4f" : "#ccc",
                                                backgroundColor: row.is_completed ? "#61bd4f" : "transparent",
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                cursor: "pointer",
                                                marginRight: "10px",
                                                transition: "all 0.2s ease-in-out",
                                                "&:hover": {
                                                    borderColor: "#61bd4f",
                                                },
                                            }}
                                        >
                                            {row.is_completed && <CheckIcon sx={{ fontSize: 14 }} />}
                                        </Box>
                                        {cardEditState.isEditing ? (
                                            <TextField
                                                value={cardEditState.tempTitle}
                                                onChange={(e) =>
                                                    setEditState((prev) => ({
                                                        ...prev,
                                                        [row.card_id]: {
                                                            ...prev[row.card_id],
                                                            tempTitle: e.target.value,
                                                        },
                                                    }))
                                                }
                                                size="small"
                                                autoFocus
                                                onBlur={() =>
                                                    handleUpdateTitle(
                                                        row.card_id,
                                                        cardEditState.tempTitle,
                                                        row.card_title
                                                    )
                                                }
                                                onKeyPress={(e) => {
                                                    if (e.key === "Enter") {
                                                        setEditState((prev) => ({
                                                            ...prev,
                                                            [row.card_id]: {
                                                                ...prev[row.card_id],
                                                                hasSaved: true,
                                                            },
                                                        }));
                                                        handleUpdateTitle(
                                                            row.card_id,
                                                            cardEditState.tempTitle,
                                                            row.card_title
                                                        );
                                                    }
                                                }}
                                                sx={{ width: "200px", mr: 1 }}
                                            />
                                        ) : (
                                            <>
                                                <span>{row.card_title}</span>
                                                <Tooltip title="Chỉnh sửa tiêu đề">
                                                    <IconButton
                                                        onClick={() =>
                                                            setEditState((prev) => ({
                                                                ...prev,
                                                                [row.card_id]: {
                                                                    ...prev[row.card_id],
                                                                    isEditing: true,
                                                                },
                                                            }))
                                                        }
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                    >
                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                    </IconButton>
                                                </Tooltip>
                                            </>
                                        )}
                                    </TableCell>

                                    <TableCell>
                                        <ListSelector
                                            cardId={row.card_id}
                                            boardId={row.board_id}
                                            listBoardId={row.list_board_id}
                                            boardLists={boardLists}
                                            onListChange={handleListChange}
                                        />
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                            {(row.labels || []).map((label, index) => {
                                                // console.log(label.name);

                                                console.log(label);

                                                return (
                                                    <Box
                                                        key={index}
                                                        sx={{
                                                            display: "inline-block",
                                                            height: "20px",
                                                            borderRadius: "4px",
                                                            backgroundColor: label.color?.hex_code,
                                                            padding: "4px 6px",
                                                            color: "white",
                                                            fontSize: "10px",
                                                            lineHeight: "12px",
                                                            overflow: "hidden",
                                                            textOverflow: "ellipsis",
                                                            whiteSpace: "nowrap",
                                                            cursor: "pointer",
                                                            mr: 0.5,
                                                        }}
                                                        title={label.name}
                                                        onClick={() => handleOpenLabelDialog(row)}
                                                    >
                                                        {label.title}
                                                    </Box>
                                                );
                                            })}

                                            {(row.labels || []).length === 0 && (
                                                <Box
                                                    sx={{
                                                        display: "inline-block",
                                                        height: "20px",
                                                        borderRadius: "4px",
                                                        backgroundColor: "#e0e0e0",
                                                        padding: "4px 6px",
                                                        color: "#000",
                                                        fontSize: "10px",
                                                        lineHeight: "12px",
                                                        cursor: "pointer",
                                                    }}
                                                    onClick={() => handleOpenLabelDialog(row)}
                                                >
                                                    +
                                                </Box>
                                            )}
                                        </Box>
                                    </TableCell>

                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                                            {(row.members || []).map((member) => (
                                                <Box
                                                    key={member.id}
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: "50%",
                                                        backgroundColor: "#0079bf",
                                                        color: "white",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        fontSize: "0.8rem",
                                                        fontWeight: "bold",
                                                    }}
                                                >
                                                    {member.full_name?.charAt(0).toUpperCase() || "?"}
                                                </Box>
                                            ))}
                                            <MemberSelector
                                                cardId={row.card_id}
                                                cardMembers={row.members || []}
                                                boardMembers={boardMembers || []}
                                                onToggleMember={handleToggleMember}
                                            />
                                        </Box>
                                    </TableCell>

                                    <TableCell sx={{ display: "flex", alignItems: "center" }}>
                                        <DateSelector
                                            cardId={row.card_id}
                                            end_date={row.end_date}
                                            end_time={row.end_time}
                                            reminder={row.reminder}
                                            is_completed={row.is_completed} // Thêm prop is_completed
                                            onUpdateDate={handleUpdateDate}
                                        />
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog LabelList */}
            {selectedCard && (
                <LabelList
                    open={openLabelDialog}
                    onClose={handleCloseLabelDialog}
                    cardId={selectedCard.card_id}
                    boardId={selectedCard.board_id}
                />
            )}
        </Box>
    );
};

export default TableView;