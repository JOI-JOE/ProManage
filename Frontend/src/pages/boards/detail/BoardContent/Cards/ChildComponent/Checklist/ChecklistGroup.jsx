import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import {
    Box,
    Typography,
    Button,
    LinearProgress,
    TextField,
    Menu,
    List,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
} from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import ChecklistItem from './CheckListItem';
import {
    usePostCheckList,
    usePostChecklistItem,
    useRemoveChecklistFromCard,
    useUpdateCheckList,
} from '../../../../../../../hooks/useCard';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';
import DeleteChecklistButton from './DeleteChecklistButton';
import LogoLoading from '../../../../../../../components/LogoLoading';
import { useBoard } from '../../../../../../../contexts/BoardContext';
import { useChecklist } from '../../../../../../../hooks/useCheckList';

const ChecklistGroup = forwardRef(({ cardId }, ref) => {
    const { data, isLoading, error, refetch: refetchChecklist } = useChecklist(cardId);
    const { mutate: postChecklist, isLoading: isPosting, error: postError } = usePostCheckList();
    const { mutate: createItem } = usePostChecklistItem();
    const { mutate: removeChecklist } = useRemoveChecklistFromCard();
    const { mutate: updateChecklistTitle } = useUpdateCheckList();
    const { members } = useBoard();

    const [checklists, setChecklists] = useState([]);
    const [newItemText, setNewItemText] = useState('');
    const [isAddingItemId, setIsAddingItemId] = useState(null);
    const [memberAnchorEl, setMemberAnchorEl] = useState(null);
    const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [editingChecklistId, setEditingChecklistId] = useState(null);
    const [editingTitle, setEditingTitle] = useState('');

    useEffect(() => {
        if (data && Array.isArray(data)) {
            const sortedData = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            const mapped = sortedData.map((cl) => ({
                id: cl.id,
                title: cl.name,
                items: cl.items.map((item) => ({
                    id: item.id,
                    name: item.name,
                    is_completed: item.is_completed,
                    start_date: item.start_date,
                    end_date: item.end_date,
                    end_time: item.end_time,
                    assignee: item.assignee ?? (Array.isArray(item.assignees) ? item.assignees[0] ?? null : null),
                    reminder: item.reminder,
                })),
            }));

            // Chỉ cập nhật nếu khác với state hiện tại
            const isDifferent = JSON.stringify(mapped) !== JSON.stringify(checklists);
            if (isDifferent) {
                setChecklists(mapped);
            }
        }
    }, [data]);



    useImperativeHandle(ref, () => ({
        addChecklistFromOutside: ({ title, copyFrom }) => {
            const tempId = Date.now();
            const optimisticChecklist = {
                id: tempId,
                title,
                copyFrom,
                items: [],
            };
            setChecklists((prev) => [...prev, optimisticChecklist]);
            const payload = {
                name: title,
                copyFrom,
            };
            postChecklist(
                { cardId, data: payload },
                {
                    onSuccess: (data) => {
                        setChecklists((prev) =>
                            prev.map((cl) =>
                                cl.id === tempId
                                    ? { ...cl, id: data.id, title: data.name }
                                    : cl
                            )
                        );
                        refetchChecklist();
                    },
                    onError: (err) => {
                        setChecklists((prev) => prev.filter((cl) => cl.id !== tempId));
                        console.error('❌ Lỗi khi thêm checklist từ outside:', err);
                    },
                }
            );
        },
    }));

    const handleDeleteChecklist = (checklistId) => {
        setChecklists((prev) => prev.filter((cl) => cl.id !== checklistId));
        removeChecklist(checklistId, {
            onSuccess: () => {
                refetchChecklist();
            },
            onError: (err) => {
                console.error('❌ Xoá checklist thất bại:', err);
            },
        });
    };

    const handleAddItem = async (checklistId) => {
        const trimmedText = newItemText.trim();
        if (!trimmedText) return;

        const tempId = Date.now();
        const optimisticItem = {
            id: tempId,
            name: trimmedText,
            is_completed: false,
            start_date: null,
            end_date: null,
            end_time: null,
            assignee: null,
            reminder: null,
            isPending: true,
        };

        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? { ...cl, items: [...cl.items, optimisticItem] }
                    : cl
            )
        );

        setNewItemText('');
        setIsAddingItemId(null);

        await createItem(
            {
                checklistId,
                data: { name: trimmedText },
            },
            {
                onSuccess: () => {
                    // Không cần cập nhật lại UI vì refetch sẽ làm việc này
                    setTimeout(() => {
                        refetchChecklist();
                    }, 300); // delay nhẹ để backend kịp xử lý xong
                },
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



    const handleToggleItem = (checklistId, itemId) => {
        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? {
                        ...cl,
                        items: cl.items.map((item) =>
                            item.id === itemId
                                ? { ...item, is_completed: !item.is_completed }
                                : item
                        ),
                    }
                    : cl
            )
        );
    };

    const handleDeleteItem = (checklistId, itemId) => {
        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId
                    ? { ...cl, items: cl.items.filter((item) => item.id !== itemId) }
                    : cl
            )
        );
    };

    const updateAssigneeInState = (itemId, assigneeId) => {
        setChecklists((prev) =>
            prev.map((cl) => ({
                ...cl,
                items: cl.items.map((item) =>
                    item.id === itemId ? { ...item, assignee: assigneeId } : item
                ),
            }))
        );
    };

    const handleUserSelected = (memberId) => {
        if (!selectedChecklistItem) return;

        updateAssigneeInState(selectedChecklistItem.id, memberId);
        if (assignCallback) assignCallback(memberId);
        handleCloseMemberMenu();
    };

    const handleRemoveAssignee = () => {
        if (!selectedChecklistItem) return;

        updateAssigneeInState(selectedChecklistItem.id, null);
        if (assignCallback) assignCallback(null);
        handleCloseMemberMenu();
    };

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

    const handleTitleClick = (checklistId, currentTitle) => {
        setEditingChecklistId(checklistId);
        setEditingTitle(currentTitle);
    };

    const handleTitleUpdate = (checklistId) => {
        const trimmedTitle = editingTitle.trim();
        if (!trimmedTitle) return;

        setChecklists((prev) =>
            prev.map((cl) =>
                cl.id === checklistId ? { ...cl, title: trimmedTitle } : cl
            )
        );
        setEditingChecklistId(null);
        setEditingTitle('');

        updateChecklistTitle(
            { checklistId, data: { name: trimmedTitle } },
            {
                onSuccess: (data) => {
                    console.log('Checklist title updated successfully:', data);
                },
                onError: (err) => {
                    setChecklists((prev) =>
                        prev.map((cl) =>
                            cl.id === checklistId
                                ? { ...cl, title: data.find((c) => c.id === checklistId)?.name || cl.title }
                                : cl
                        )
                    );
                    console.error('Failed to update checklist title:', err);
                },
            }
        );
    };

    const filteredMembers = members.filter((m) =>
        m?.full_name?.toLowerCase().includes(memberSearch.toLowerCase())
    );

    const [assignCallback, setAssignCallback] = useState(null);
    const openMemberMenu = Boolean(memberAnchorEl);

    const handleOpenMemberMenu = (event, item, assignFn) => {
        setMemberAnchorEl(event.currentTarget);
        setSelectedChecklistItem(item);
        setAssignCallback(() => assignFn);
    };

    const handleCloseMemberMenu = () => {
        setMemberAnchorEl(null);
        setSelectedChecklistItem(null);
        setMemberSearch('');
        setAssignCallback(null);
    };

    return (
        <Box>
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
                                {editingChecklistId === checklist.id ? (
                                    <TextField
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        onBlur={() => handleTitleUpdate(checklist.id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                handleTitleUpdate(checklist.id);
                                            }
                                        }}
                                        autoFocus
                                        variant="outlined"
                                        size="small"
                                        sx={{
                                            '& .MuiInputBase-input': {
                                                padding: '4px 8px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: '#42526E',
                                                minWidth: '400px',
                                            },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: '#42526E' },
                                                '&:hover fieldset': { borderColor: '#42526E' },
                                                '&.Mui-focused fieldset': { borderColor: '#42526E' },
                                            },
                                        }}
                                    />
                                ) : (
                                    <Typography
                                        variant="body1"
                                        fontWeight="bold"
                                        color="#42526E"
                                        onClick={() => handleTitleClick(checklist.id, checklist.title)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        {checklist.title}
                                    </Typography>
                                )}
                            </Box>
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
                                onToggle={() => handleToggleItem(checklist.id, item.id)}
                                onDeleteItem={handleDeleteItem}
                                refetchChecklist={refetchChecklist}
                                onNameChange={handleUpdateItemName}
                                onDateChange={(newDateData) =>
                                    handleUpdateItemDate(checklist.id, item.id, newDateData)
                                }
                                onOpenMemberMenu={(e, item, assignFn) =>
                                    handleOpenMemberMenu(e, item, assignFn)
                                }
                            />
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
                                    <Button
                                        onClick={() => handleAddItem(checklist.id)}
                                        size="small"
                                        variant="contained"
                                    >
                                        Thêm
                                    </Button>
                                    <Button
                                        onClick={() => setIsAddingItemId(null)}
                                        size="small"
                                    >
                                        Huỷ
                                    </Button>
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
                                selected={selectedChecklistItem?.assignee === member.id}
                            >
                                <ListItemAvatar>
                                    <InitialsAvatar
                                        sx={{
                                            fontSize: '14px',
                                            width: '32px',
                                            height: '32px',
                                        }}
                                        size={'32px'}
                                        initials={member.initials}
                                        name={member.full_name}
                                        avatarSrc={member.image}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={member.full_name} />
                            </ListItemButton>
                        ))}
                    </List>

                    {selectedChecklistItem?.assignee && (
                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={handleRemoveAssignee}
                            sx={{ mt: 1 }}
                        >
                            Loại bỏ thành viên
                        </Button>
                    )}
                </Box>
            </Menu>
        </Box>
    );
});

export default ChecklistGroup;