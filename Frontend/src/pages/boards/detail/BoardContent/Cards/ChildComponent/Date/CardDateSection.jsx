import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Box, Typography, Chip, useTheme, IconButton } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import DateItem from './DateItem';
import { useUpdateCardById } from '../../../../../../../hooks/useCard';

dayjs.locale('vi');

const CardDateSection = forwardRef(({ cardData, cardId }, ref) => {
    const theme = useTheme();
    const [isDateDialogOpen, setIsDateDialogOpen] = useState(false);
    const [date, setDate] = useState({
        start: null,
        due: null,
        dueTime: null,
        dueReminder: null,
        dueComplete: false,
    });

    const { updateDates, isUpdating, error } = useUpdateCardById(cardId);

    useEffect(() => {
        if (cardData) {
            setDate({
                start: cardData.start && dayjs(cardData.start).isValid() ? cardData.start : null,
                due: cardData.due && dayjs(cardData.due).isValid() ? cardData.due : null,
                dueTime: cardData.dueTime && dayjs(cardData.dueTime, 'HH:mm').isValid() ? cardData.dueTime : null,
                dueReminder: cardData.dueReminder || null,
                dueComplete: cardData.dueComplete ?? false,
            });
        }
    }, [cardData]);

    const handleOpenDateDialog = () => {
        setIsDateDialogOpen(true);
    };

    const handleCloseDateDialog = () => {
        setIsDateDialogOpen(false);
    };

    const handleSaveDate = (dateData) => {
        const newDate = {
            start: dateData.startDate && dayjs(dateData.startDate).isValid() ? dateData.startDate : null,
            due: dateData.endDate && dayjs(dateData.endDate).isValid() ? dateData.endDate : null,
            dueTime: dateData.endTime && dayjs(dateData.endTime, 'HH:mm').isValid() ? dateData.endTime : null,
            dueReminder: dateData.reminder || null,
            dueComplete: dateData.dueComplete ?? false,
        };

        const hasChanges =
            dateData.startDate !== (cardData.start || null) ||
            dateData.endDate !== (cardData.due || null) ||
            dateData.endTime !== (cardData.dueTime || null) ||
            dateData.reminder !== (cardData.dueReminder || null) ||
            dateData.dueComplete !== (cardData.dueComplete ?? false);

        if (hasChanges) {
            updateDates(
                {
                    startDate: dateData.startDate,
                    endDate: dateData.endDate,
                    endTime: dateData.endTime,
                    reminder: dateData.reminder,
                    dueComplete: dateData.dueComplete,
                },
                {
                    onSuccess: () => {
                        setDate(newDate); // Update local state only on success
                        handleCloseDateDialog();
                    },
                    onError: (error) => {
                        console.error("Failed to update card dates:", error.message || error);
                    },
                }
            );
        } else {
            handleCloseDateDialog();
        }
    };

    useImperativeHandle(ref, () => ({
        openDateDialog: handleOpenDateDialog,
    }));

    const formatDateDisplay = () => {
        if (!date || (!date.due && !date.start)) return 'Chưa đặt ngày';

        let displayText = '';

        if (date.start && dayjs(date.start).isValid()) {
            const startDate = dayjs(date.start);
            displayText += `${startDate.format('DD/MM')}`;
        } else if (date.start) {
            return 'Invalid Date';
        }

        if (date.due && dayjs(date.due).isValid()) {
            const dueDate = dayjs(date.due);
            const dueTime = date.dueTime && dayjs(date.dueTime, 'HH:mm').isValid() ? dayjs(date.dueTime, 'HH:mm') : null;

            if (date.start && dayjs(date.start).isSame(dueDate, 'day')) {
                displayText = dueTime
                    ? `${dueTime.format('HH:mm')} - ${dueDate.format('DD/MM')}`
                    : `${dueDate.format('DD/MM')}`;
            } else {
                displayText += date.start && dayjs(date.start).isValid() ? ' → ' : '';
                displayText += dueTime
                    ? `${dueTime.format('HH:mm')} - ${dueDate.format('DD/MM')}`
                    : `${dueDate.format('DD/MM')}`;
            }
        } else if (date.due) {
            return 'Invalid Date';
        }

        return displayText.trim() || 'Invalid Date';
    };

    const getDueStatus = () => {
        if (date.dueComplete) {
            return { text: 'Hoàn tất', color: theme.palette.success.main };
        }

        if (!date?.due || !dayjs(date.due).isValid()) return null;

        const now = dayjs();
        const dueDate = dayjs(date.due);
        const dueTime = date.dueTime && dayjs(date.dueTime, 'HH:mm').isValid() ? dayjs(date.dueTime, 'HH:mm') : null;

        let dueDateTime = dueDate;
        if (dueTime) {
            dueDateTime = dueDate.set('hour', dueTime.hour()).set('minute', dueTime.minute());
        }

        if (dueDateTime.isBefore(now)) {
            return { text: 'Quá hạn', color: theme.palette.error.main };
        }

        if (dueDateTime.diff(now, 'hour') <= 24) {
            return { text: 'Sắp hết hạn', color: theme.palette.warning.main };
        }

        return null;
    };

    const dueStatus = getDueStatus();
    const hasDates = date.start || date.due;

    return (
        <>
            {hasDates && (
                <Box sx={{ minWidth: '200px', mb: 2 }}>
                    <Typography
                        variant="subtitle2"
                        sx={{ color: theme.palette.text.secondary, fontWeight: 600 }}
                    >
                        Ngày
                    </Typography>

                    <Box
                        onClick={handleOpenDateDialog}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 0.6,
                            py: 0.3,
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                            boxShadow: theme.shadows[1],
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                                boxShadow: theme.shadows[3],
                                backgroundColor: theme.palette.action.hover,
                            },
                        }}
                    >
                        <Box sx={{
                            display

                                : 'flex', alignItems: 'center', gap: 1.5
                        }}>
                            <CalendarTodayIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                            <Typography
                                variant="body2"
                                sx={{ fontWeight: 500, color: theme.palette.text.primary }}
                            >
                                {formatDateDisplay()}
                            </Typography>
                            {dueStatus && (
                                <Chip
                                    label={dueStatus.text}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        backgroundColor: dueStatus.color,
                                        color: theme.palette.getContrastText(dueStatus.color),
                                        borderRadius: 1,
                                    }}
                                />
                            )}
                        </Box>
                        <IconButton size="small" disabled={isUpdating}>
                            <AccessTimeIcon sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
                        </IconButton>
                    </Box>

                    {error && (
                        <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                            Lỗi: {error.message || 'Không thể cập nhật ngày'}
                        </Typography>
                    )}
                </Box>
            )}

            <DateItem
                open={isDateDialogOpen}
                onClose={handleCloseDateDialog}
                onSave={handleSaveDate}
                type="card"
                item={{
                    start_date: date?.start || null,
                    end_date: date?.due || null,
                    end_time: date?.dueTime || null,
                    reminder: date?.dueReminder || null,
                    dueComplete: date?.dueComplete ?? false,
                }}
            />
        </>
    );
});

export default CardDateSection;