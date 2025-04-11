import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    TextField,
    Menu,
    MenuItem,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import DateItem from '../Date/DateItem';
import ChecklistItem from './CheckListItem';
import { useChecklist, usePostCheckList, usePostChecklistItem, useRemoveChecklistFromCard } from '../../../../../../../hooks/useCard';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';
import DeleteChecklistButton from './DeleteChecklistButton';
import LogoLoading from '../../../../../../../components/LogoLoading';
import { useBoard } from '../../../../../../../contexts/BoardContext';

const ChecklistGroup = forwardRef(({ cardId }, ref) => {
    const { data, isLoading, error } = useChecklist(cardId);
    const { mutate: postChecklist } = usePostCheckList(); // Hook mutation để tạo checklist
    const { mutate: createItem } = usePostChecklistItem();
    const { mutate: removeChecklist } = useRemoveChecklistFromCard();
    const { members } = useBoard()

    const [checklists, setChecklists] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [isAddingItemId, setIsAddingItemId] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null); // For delete menu
    const [selectedItem, setSelectedItem] = useState(null);

    // State để quản lý DateItem và MemberMenu
    const [memberAnchorEl, setMemberAnchorEl] = useState(null);
    const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const mapped = data.map(cl => ({
                id: cl.id,
                title: cl.name,
                items: cl.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    is_completed: item.is_completed,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    end_time: item.end_time,
                    assignees: item.assignees,
                    reminder: item.reminder,
                }))
            }));
            setChecklists(mapped);
        }
    }, [data]);

    useImperativeHandle(ref, () => ({
        addChecklistFromOutside: ({ title, copyFrom }) => {
            const tempId = Date.now(); // ID tạm thời
            const optimisticChecklist = {
                id: tempId,
                title,
                copyFrom,
                items: [],
            };
            setChecklists((prev) => [...prev, optimisticChecklist]);

            const payload = {
                name: title,
                copyFrom, // Nếu có copyFrom, gửi lên server
            };
            postChecklist(
                { cardId, data: payload },
                {
                    onSuccess: (data) => {
                        setChecklists((prev) =>
                            prev.map((cl) =>
                                cl.id === tempId
                                    ? { ...cl, id: data.id, title: data.name } // Cập nhật ID thật từ server
                                    : cl
                            )
                        );
                    },
                    onError: (err) => {
                        setChecklists((prev) => prev.filter((cl) => cl.id !== tempId)); // Rollback nếu lỗi
                        console.error("❌ Lỗi khi thêm checklist từ outside:", err);
                    },
                }
            );
        },
    }));
    const handleDeleteChecklist = (checklistId) => {
        setChecklists((prev) => prev.filter((cl) => cl.id !== checklistId));
        removeChecklist(checklistId, {
            onError: (err) => {
                console.error('Xoá checklist thất bại:', err);
            },
        });
    };
    // Thêm mới checklistitem
    const handleAddItem = (checklistId) => {
        const trimmedText = newItemText.trim();
        if (!trimmedText) return;

        const tempId = Date.now();

        const optimisticItem = {
            id: tempId,
            name: trimmedText,
            is_completed: false,
            start_date: null,
            end_date: null,
            assignees: [],
            reminder: null,
            isPending: true,
        };

        // Thêm item tạm thời vào checklist
        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? { ...cl, items: [...cl.items, optimisticItem] }
                    : cl
            )
        );
        // Reset input & trạng thái thêm
        setNewItemText('');
        setIsAddingItemId(null);
        // Gọi API tạo item thật
        createItem(
            {
                checklistId,
                data: { name: trimmedText },
            },
            {
                onError: () => {
                    setChecklists((prev) =>
                        prev.map((cl) =>
                            cl.id === checklistId
                                ? {
                                    ...cl,
                                    items: cl.items.filter((item) => item.id !== tempId),
                                }
                                : cl
                        )
                    );
                },
            }
        );
    };
    // Chính sửa 
    const handleToggleItem = (checklistId, itemId) => {
        const updatedChecklists = checklists.map((cl) =>
            cl.id === checklistId
                ? {
                    ...cl,
                    items: cl.items.map((item) =>
                        item.id === itemId ? { ...item, is_completed: !item.is_completed } : item
                    ),
                }
                : cl
        );
        setChecklists(updatedChecklists);
    };
    const handleDeleteItem = (checklistId, itemId) => {
        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) }
                    : cl
            )
        );
        handleMenuClose();
    };
    // Hàm cập nhật assign trong local state
    const updateAssigneesInState = (itemId, assignees) => {
        const updated = checklists.map((cl) => ({
            ...cl,
            items: cl.items.map((item) =>
                item.id === itemId ? { ...item, assignees } : item
            ),
        }));

        setChecklists(updated);
    };
    // Khi chọn thành viên
    const handleUserSelected = (memberId) => {
        if (!selectedChecklistItem) return;

        const currentAssignees = selectedChecklistItem.assignees || [];

        // Tránh thêm trùng
        const newAssignees = currentAssignees.includes(memberId)
            ? currentAssignees
            : [...currentAssignees, memberId];

        updateAssigneesInState(selectedChecklistItem.id, newAssignees);

        // Gọi API callback
        if (assignCallback) assignCallback(memberId);

        handleCloseMemberMenu();
    };
    // Khi bấm "Loại bỏ thành viên"
    const handleRemoveAssignee = () => {
        if (!selectedChecklistItem) return;

        updateAssigneesInState(selectedChecklistItem.id, []);

        if (assignCallback) assignCallback(null);

        handleCloseMemberMenu();
    };
    // Hàm sửa đổi tên 
    const handleUpdateItemName = (itemId, newName) => {
        setChecklists((prev) =>
            prev.map((cl) => ({
                ...cl,
                items: cl.items.map((item) =>
                    item.id === itemId ? { ...item, name: newName } : item
                ),
            }))
        );
    };
    // Hàn sửa date
    const handleUpdateItemDate = (checklistId, itemId, newDateData) => {
        const { end_date, end_time } = newDateData;

        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? {
                        ...cl,
                        items: cl.items.map((item) =>
                            item.id === itemId
                                ? { ...item, end_date, end_time }
                                : item
                        ),
                    }
                    : cl
            )
        );
    };
    // ----------------------------------------------------------------
    const filteredMembers = members.filter((m) =>
        m?.full_name?.toLowerCase().includes(memberSearch.toLowerCase())
    );
    // const handleMenuOpen = (event, checklistId, itemId) => {
    //     setAnchorEl(event.currentTarget);
    //     setSelectedItem({ checklistId, itemId });
    // };
    const [assignCallback, setAssignCallback] = useState(null);
    const openMemberMenu = Boolean(memberAnchorEl);

    const handleOpenMemberMenu = (event, item, assignFn) => {
        setMemberAnchorEl(event.currentTarget);
        setSelectedChecklistItem(item);
        setAssignCallback(() => assignFn); // Lưu function callback từ con
    };
    const handleCloseMemberMenu = () => {
        setMemberAnchorEl(null);
        setSelectedChecklistItem(null);
        setMemberSearch('');
        setAssignCallback(null); // Clear callback để tránh dùng nhầm
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedItem(null);
    };

    return (
        <Box>
            {/* {isLoading && <Typography>Đang tải...</Typography>} */}
            {isLoading && <LogoLoading scale={0.3} />}
            {error && <Typography color="error">Lỗi: {error.message}</Typography>}

            {checklists.map((checklist) => {
                const completedCount = checklist.items.filter((item) => item.is_completed).length;
                const progress = checklist.items.length
                    ? (completedCount / checklist.items.length) * 100
                    : 0;

                return (
                    <Box key={checklist.id} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CheckBoxIcon sx={{ color: '#42526E' }} />
                                <Typography variant="body1" fontWeight="bold" color="#42526E">
                                    {checklist.title}
                                </Typography>
                            </Box>
                            {/* <Button
                                size="small"
                                onClick={() => handleDeleteChecklist(checklist.id)}
                                sx={{ backgroundColor: '#DFE1E6' }}
                            >
                                Xóa
                            </Button> */}
                            <DeleteChecklistButton
                                checklistId={checklist.id}
                                handleDeleteChecklist={handleDeleteChecklist}
                            />
                        </Box>

                        <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="#6B778C">
                                {Math.round(progress)}%
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={(theme) => ({
                                    height: 6,
                                    borderRadius: 4,
                                    backgroundColor: theme.palette.grey[300],
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor:
                                            progress === 100
                                                ? theme.palette.success.main
                                                : theme.palette.primary.main,
                                    },
                                })}
                            />
                        </Box>

                        {checklist.items.map((item) => (
                            <ChecklistItem
                                key={item.id}
                                item={{ ...item, checklistId: checklist.id }}
                                members={members}
                                onToggle={() => handleToggleItem(checklist.id, item.id)} // <-- đúng
                                onOpenDateDialog={() => handleOpenDateDialog(item.id)}
                                onOpenMemberMenu={(e, item, assignFn) => handleOpenMemberMenu(e, item, assignFn)}
                                // onMenuOpen={() => handleMenuOpen(item)}
                                onDeleteItem={handleDeleteItem}
                                onNameChange={handleUpdateItemName} // xử lý tên
                                onDateChange={(newDateData) => handleUpdateItemDate(checklist.id, item.id, newDateData)} />
                        ))}

                        {isAddingItemId === checklist.id ? (
                            <Box>
                                <TextField
                                    fullWidth
                                    size="small"
                                    placeholder="Thêm một mục..."
                                    value={newItemText}
                                    onChange={(e) => setNewItemText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddItem(checklist.id)}
                                    autoFocus
                                />
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                                    <Button onClick={() => handleAddItem(checklist.id)} size="small" variant="contained">
                                        Thêm
                                    </Button>
                                    <Button onClick={() => setIsAddingItemId(null)} size="small">Huỷ</Button>
                                </Box>
                            </Box>
                        ) : (
                            <Button
                                onClick={() => setIsAddingItemId(checklist.id)}
                                size="small"
                                sx={{ mt: 1, backgroundColor: '#DFE1E6' }}
                            >
                                Thêm một mục
                            </Button>
                        )}
                    </Box>
                );
            })}

            <Menu
                id="member-menu"
                anchorEl={memberAnchorEl}
                open={openMemberMenu}
                onClose={handleCloseMemberMenu}
                MenuListProps={{
                    'aria-labelledby': 'member-button',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                sx={{ p: 1 }}
            >
                <Box px={1} py={1} width={300}>
                    <Typography fontWeight={600} fontSize={16} mb={0.5}>
                        Chỉ định
                    </Typography>

                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Tìm kiếm các thành viên"
                        value={memberSearch}
                        onChange={(e) => setMemberSearch(e.target.value)}
                        sx={{ mb: 0.5 }}
                    />

                    <Typography fontWeight={500} fontSize={13}>
                        Thành viên của bảng
                    </Typography>

                    <List disablePadding>
                        {filteredMembers.map((member) => (
                            <ListItemButton
                                key={member.id}
                                onClick={() => handleUserSelected(member.id)}
                            >
                                <ListItemAvatar>
                                    <InitialsAvatar
                                        sx={{
                                            fontSize: "14px",
                                            width: "32px",
                                            height: "32px",
                                        }}
                                        size={"32px"}
                                        initials={member.initials}
                                        name={member.full_name}
                                        avatarSrc={member.image}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={member.full_name} />
                            </ListItemButton>
                        ))}
                    </List>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={handleRemoveAssignee}
                        sx={{ mt: 1 }}
                    >
                        Loại bỏ thành viên
                    </Button>
                </Box>
            </Menu>

            {/* <DateItem
                open={isDateDialogOpen}
                onClose={handleCloseDateDialog}
                type="checklist-item"
                targetId={selectedChecklistItem?.id || ''}
            /> */}
        </Box>
    );
});

export default ChecklistGroup;