import React, { useState, useRef, useEffect } from 'react';
import { Box, Checkbox, Typography, IconButton } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';
import { useUpdateCheckListItem } from '../../../../../../../hooks/useCard';
import ChecklistItemMenu from './ChecklistItemMenu';
import DateItem from '../Date/DateItem';

const ChecklistItem = ({
    item,
    members,
    onOpenMemberMenu,
    onToggle,
    onAssign,
    onDeleteItem,
    onNameChange,
}) => {
    const {
        updateStatus,
        updateAssignee,
        updateName,
        isPending: isUpdating,
    } = useUpdateCheckListItem(item.id);

    const assignedMember =
        Array.isArray(item.assignees) && item.assignees.length > 0
            ? members.find((m) => m.id === item.assignees[0])
            : null;

    const handleToggle = () => {
        onToggle?.();
        updateStatus(!item.is_completed);
    };

    const handleAssign = (memberId) => {
        onAssign?.(item.id, memberId);
        updateAssignee(memberId);
    };

    const handleDeleteItem = () => {
        onDeleteItem?.(item.checklistId, item.id);
    };

    // State for editing name
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(item.name);
    const textareaRef = useRef(null);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            const textarea = textareaRef.current;
            textarea.style.height = 'auto';
            textarea.style.height = `${textarea.scrollHeight}px`;
        }
    }, [isEditing, editedName]);

    const handleNameUpdate = async () => {
        const trimmedName = editedName.trim();
        setIsEditing(false);

        if (trimmedName === item.name || trimmedName === '') {
            setEditedName(item.name);
            return;
        }

        try {
            await updateName(trimmedName);
            onNameChange?.(item.id, trimmedName);
        } catch (error) {
            console.error('❌ Failed to update checklist item name:', error);
            setEditedName(item.name);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleNameUpdate();
        } else if (e.key === 'Escape') {
            setEditedName(item.name);
            setIsEditing(false);
        }
    };

    // State & handler for Date Dialog
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [selectedChecklistItem, setSelectedChecklistItem] = useState(null);

    const handleOpenDateDialog = () => {
        setSelectedChecklistItem(item);
        setIsDateDialogOpen(true);
    };

    const handleCloseDateDialog = () => {
        setIsDateDialogOpen(false);
        setSelectedChecklistItem(null);
    };

    // Determine if a due date exists (using end_date for this example)
    const hasDueDate = item.end_date !== null;
    const dueDate = hasDueDate ? new Date(item.end_date) : null;

    console.log(item)

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: '#DFE1E6',
                    borderRadius: 2,
                    px: 1,
                    py: 0.5,
                    mb: 0.5,
                    transition: 'background-color 0.2s ease',
                    '&:hover .action-icons': { opacity: 1 },
                    opacity: isUpdating ? 0.6 : 1,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
                    <Checkbox
                        checked={item.is_completed}
                        onChange={handleToggle}
                        checkedIcon={<CheckBoxIcon sx={{ fontSize: 20 }} />}
                        sx={{
                            padding: 0,
                            marginRight: 1,
                            color: '#0052CC',
                            '&.Mui-checked': { color: '#0052CC' },
                        }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        {isEditing ? (
                            <textarea
                                ref={textareaRef}
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                onBlur={handleNameUpdate}
                                onKeyDown={handleKeyDown}
                                autoFocus
                                style={{
                                    fontSize: '0.875rem',
                                    border: '1px solid #388BFF',
                                    borderRadius: '4px',
                                    padding: '6px 8px',
                                    outline: 'none',
                                    fontFamily: 'inherit',
                                    backgroundColor: '#fff',
                                    boxShadow: '0 0 0 2px rgba(56, 139, 255, 0.2)',
                                    width: '100%',
                                    minWidth: '200px',
                                    maxWidth: '100%',
                                    boxSizing: 'border-box',
                                    resize: 'none',
                                    overflow: 'hidden',
                                }}
                            />
                        ) : (
                            <Typography
                                variant="body2"
                                sx={{
                                    textDecoration: item.is_completed ? 'line-through' : 'none',
                                    color: item.is_completed ? 'gray' : 'inherit',
                                    cursor: 'pointer',
                                    '&:hover': { textDecoration: 'underline' },
                                    flex: 1,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'normal',
                                }}
                                onClick={() => setIsEditing(true)}
                            >
                                {item.name}
                            </Typography>
                        )}
                        {/* Display due date if it exists */}

                    </Box>
                </Box>
                <Box
                    className="action-icons"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        opacity: assignedMember || hasDueDate ? 1 : 0,
                        transition: 'opacity 0.2s ease',
                        flexShrink: 0,
                        marginLeft: 1,
                        gap: 0.5,
                    }}
                >
                    {hasDueDate ? (
                        <Box
                            onClick={handleOpenDateDialog}
                            sx={(theme) => {
                                const now = new Date(); // Thời gian hiện tại
                                const due = new Date(item.end_date); // Thời gian đến hạn
                                const timeDiff = due.getTime() - now.getTime(); // Khoảng cách thời gian (ms)
                                const hoursLeft = timeDiff / (1000 * 60 * 60); // Số giờ còn lại

                                let bgColor = 'transparent';
                                let textColor = 'white';

                                // ✅ TH1: ĐÃ HOÀN THÀNH
                                // Nếu checklist item đã hoàn thành => hiển thị màu xanh (success)
                                if (item.is_completed) {
                                    bgColor = theme.alert?.success || '#28a745'; // Màu xanh
                                }
                                // ❌ TH2: QUÁ HẠN
                                // Nếu thời hạn < hiện tại => quá hạn => hiển thị màu đỏ (danger)
                                else if (due < now) {
                                    bgColor = theme.alert?.danger || '#dc3545'; // Màu đỏ
                                }
                                // ⚠️ TH3: SẮP ĐẾN HẠN
                                // Nếu còn <= 24 giờ đến hạn => hiển thị màu vàng (warning)
                                else if (hoursLeft <= 24) {
                                    bgColor = theme.alert?.warning || '#ffc107'; // Màu vàng
                                }
                                // ℹ️ TH4: CHƯA ĐẾN HẠN XA
                                // Nếu còn nhiều hơn 24 giờ => màu xám mặc định
                                else {
                                    bgColor = theme.palette.grey[300] || '#e0e0e0'; // Màu xám
                                    textColor = 'black';
                                }

                                return {
                                    cursor: 'pointer',
                                    backgroundColor: bgColor,
                                    color: textColor,
                                    padding: '0.5px 8px',
                                    borderRadius: '32px',
                                    display: 'inline-flex',
                                    fontSize: "0px",
                                    alignItems: 'center',
                                    gap: '4px',
                                    transition: 'background-color 0.2s ease, opacity 0.2s ease',
                                    '&:hover': {
                                        opacity: 0.9,
                                        backgroundColor: bgColor, // vẫn giữ màu nhưng tạo hiệu ứng mờ nhẹ
                                    },
                                };
                            }}
                        >
                            <AccessTimeRoundedIcon sx={{ fontSize: 16 }} />
                            <Typography variant="caption" >
                                {new Date(item.end_date).toLocaleDateString('vi-VN', {
                                    day: 'numeric',
                                    month: 'short',
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        <IconButton size="small">
                            <AccessTimeIcon fontSize="small" onClick={handleOpenDateDialog} />
                        </IconButton>
                    )}


                    <IconButton
                        size="small"
                        onClick={(e) => onOpenMemberMenu(e, item, handleAssign)}
                    >
                        {assignedMember ? (
                            <InitialsAvatar
                                sx={{
                                    fontSize: '14px',
                                    width: '20px',
                                    height: '20px',
                                }}
                                size={'32px'}
                                initials={assignedMember.initials}
                                name={assignedMember.full_name}
                                avatarSrc={assignedMember.image}
                            />
                        ) : (
                            <PersonAddIcon fontSize="small" />
                        )}
                    </IconButton>
                    <ChecklistItemMenu
                        onDelete={handleDeleteItem}
                        icon={<MoreHorizIcon fontSize="small" />}
                    />
                </Box>
            </Box >

            {/* Dialog chọn ngày */}
            <DateItem
                open={isDateDialogOpen}
                onClose={handleCloseDateDialog}
                type="checklist-item"
                item={selectedChecklistItem}
            // onSave={handleUpdateDueDate}
            />
        </>
    );
};

export default ChecklistItem;