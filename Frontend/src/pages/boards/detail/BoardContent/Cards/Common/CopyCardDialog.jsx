import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useBoard } from '../../../../../../contexts/BoardContext';
import { useWorkspace } from '../../../../../../contexts/WorkspaceContext';
import { useParams } from 'react-router-dom';
import { useListByBoardId } from '../../../../../../hooks/useList';
import { calculateItemPosition } from '../../../../../../../utils/calculateItemPosition';
import { cloneDeep } from 'lodash';
import { useCopyCard } from '../../../../../../hooks/useCard';
import LogoLoading from '../../../../../../components/LogoLoading';
import { optimisticIdManager } from '../../../../../../../utils/optimisticIdManager';

const CopyCardPopUp = forwardRef(({ onCopyCard, card }, ref) => {
    const { boardId } = useParams();
    const { orderedLists, updateOrderedLists } = useBoard();
    const { workspaces, guestWorkspaces } = useWorkspace();
    const { mutateAsync: copyCard, isLoading: copyCardLoading } = useCopyCard();

    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [name, setName] = useState('');
    const [keepItems, setKeepItems] = useState({
        checklists: true,
        labels: true,
        members: true,
        attachments: true,
        dates: true,
    });

    // Initialize with boardId to ensure controlled state
    const [board, setBoard] = useState(boardId || '');
    const [list, setList] = useState('');
    const [position, setPosition] = useState('1');
    const [boards, setBoards] = useState([]);
    const [lists, setLists] = useState([]);
    const [remoteListsData, setRemoteListsData] = useState(null);
    const [selectedPositionIndex, setSelectedPositionIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: remoteListsDataFetched, isLoading: remoteListsLoading } = useListByBoardId(board, {
        enabled: board !== boardId && !!board,
    });

    useImperativeHandle(ref, () => ({
        open: (anchorElement) => {
            setAnchorEl(anchorElement);
            setOpen(true);
        },
        close: () => {
            setOpen(false);
        },
    }));

    useEffect(() => {
        if (open && card) {
            setName(card.title ? `${card.title} (Copy)` : '');

            const allBoards = [
                ...workspaces.flatMap((workspace) =>
                    workspace.boards.map((board) => ({
                        id: board.id,
                        name: board.name,
                    }))
                ),
                ...guestWorkspaces.flatMap((workspace) =>
                    workspace.boards.map((board) => ({
                        id: board.id,
                        name: board.name,
                    }))
                ),
            ];
            setBoards(allBoards);
            setBoard(boardId || allBoards[0]?.id || ''); // Default to boardId or first board

            if (orderedLists && boardId) {
                const currentLists = orderedLists.map((list) => ({
                    id: list.id,
                    name: list.name || 'Danh sách không tên',
                }));
                setLists(currentLists);
                setList(card?.list_board_id || currentLists[0]?.id || '');
                setPosition('1');
                setSelectedPositionIndex(0);
            }
        }
    }, [open, card, workspaces, guestWorkspaces, orderedLists, boardId]);

    useEffect(() => {
        if (board !== boardId && remoteListsDataFetched) {
            setRemoteListsData(remoteListsDataFetched);
            const remoteLists = remoteListsDataFetched.lists.map((list) => ({
                id: list.id,
                name: list.name || 'Danh sách không tên',
            }));
            setLists(remoteLists);
            setList(remoteLists[0]?.id || '');
            setPosition('1');
            setSelectedPositionIndex(0);
        }
    }, [remoteListsDataFetched, board, boardId]);

    const handleKeepItemChange = (item) => {
        setKeepItems((prev) => ({
            ...prev,
            [item]: !prev[item],
        }));
    };

    const handleBoardChange = (event) => {
        const selectedBoardId = event.target.value;
        setBoard(selectedBoardId);

        if (selectedBoardId === boardId && orderedLists) {
            const currentLists = orderedLists.map((list) => ({
                id: list.id,
                name: list.name || 'Danh sách không tên',
            }));
            setLists(currentLists);
            setList(card?.list_board_id || currentLists[0]?.id || '');
            setPosition('1');
            setSelectedPositionIndex(0);
        } else {
            setLists([]);
            setList('');
            setPosition('1');
            setSelectedPositionIndex(0);
        }
    };

    const handleListChange = (event) => {
        const selectedListId = event.target.value;
        setList(selectedListId);
        setPosition('1');
        setSelectedPositionIndex(0);
    };

    const handlePositionChange = (event) => {
        const pos = event.target.value;
        setPosition(pos);
        setSelectedPositionIndex(parseInt(pos) - 1);
    };

    const handleClose = () => {
        setOpen(false);
        setRemoteListsData(null);
        setBoard(boardId || ''); // Reset to boardId
        setList('');
        setPosition('1');
        setSelectedPositionIndex(0);
    };

    const getCardsInSelectedList = () => {
        if (!list) return [];
        if (board === boardId) {
            const selectedList = orderedLists.find((l) => l.id === list);
            return (
                selectedList?.cards
                    .filter((c) => !c.FE_PlaceholderCard)
                    .sort((a, b) => a.position - b.position) || []
            );
        } else {
            return (remoteListsData?.cards || [])
                .filter((c) => c.list_board_id === list)
                .sort((a, b) => a.position - b.position);
        }
    };

    const handleCopyCard = async () => {
        if (!board || !list || !name || isSubmitting) {
            console.error('Missing required fields or already submitting:', { board, list, name, isSubmitting });
            return;
        }

        try {
            setIsSubmitting(true);

            const positionIndex = selectedPositionIndex;
            const cardsInList = getCardsInSelectedList();

            // Calculate position
            const calculatedPosition = calculateItemPosition(positionIndex, cardsInList, null);

            // Optimistic update for the current board
            if (board === boardId) {
                updateOrderedLists((prevLists) => {
                    const nextLists = cloneDeep(prevLists);
                    const targetList = nextLists.find((l) => l.id === list);
                    if (!targetList) return prevLists;

                    const typename = 'card';
                    const optimisticId = optimisticIdManager.generateOptimisticId(typename);
                    const newCard = {
                        ...card,
                        id: optimisticId,
                        title: name,
                        list_board_id: list,
                        position: calculatedPosition,
                        FE_PlaceholderCard: false,
                        labels: keepItems.labels ? [...(card.labels || [])] : [],
                        tasks: keepItems.checklists ? [...(card.tasks || [])] : [],
                        attachments: keepItems.attachments ? [...(card.attachments || [])] : [],
                    };

                    targetList.cards = targetList.cards
                        .filter((c) => !c.FE_PlaceholderCard)
                        .sort((a, b) => a.position - b.position);

                    if (positionIndex >= targetList.cards.length) {
                        targetList.cards.push(newCard);
                    } else {
                        targetList.cards.splice(positionIndex, 0, newCard);
                    }

                    return nextLists;
                });
            }

            // Call API to copy card
            const response = await copyCard({
                cardId: card.id,
                data: {
                    title: name,
                    targetListBoardId: list,
                    position: calculatedPosition,
                    keepLabels: keepItems.labels,
                    keepChecklists: keepItems.checklists,
                    keepAttachments: keepItems.attachments,
                    keepDates: keepItems.dates,
                    keepMembers: keepItems.members,
                },
            });

            // Update UI with actual data from API
            if (board === boardId && response?.card) {
                updateOrderedLists((prevLists) => {
                    const nextLists = cloneDeep(prevLists);
                    const targetList = nextLists.find((l) => l.id === list);
                    if (targetList) {
                        targetList.cards = targetList.cards.filter(
                            (c) => !c.id.startsWith('Optimistic_card_') || c.title !== name
                        );

                        const newCard = {
                            ...response.card,
                            position: response.card.position || calculatedPosition,
                        };

                        targetList.cards.push(newCard);
                        targetList.cards.sort((a, b) => a.position - b.position);
                    }
                    return nextLists;
                });
            }

            if (onCopyCard) {
                onCopyCard(response?.card);
            }

            setIsSubmitting(false);
            handleClose();
        } catch (error) {
            console.error('Failed to copy card:', error);
            if (board === boardId) {
                updateOrderedLists((prevLists) => {
                    const nextLists = cloneDeep(prevLists);
                    const targetList = nextLists.find((l) => l.id === list);
                    if (targetList) {
                        targetList.cards = targetList.cards.filter(
                            (c) => !c.id.startsWith('Optimistic_card_') || c.title !== name
                        );
                    }
                    return nextLists;
                });
            }
            setIsSubmitting(false);
        }
    };

    // Calculate badge counts safely
    const checklistCount = card?.badges?.checkItems;
    const labelCount = card?.labels?.length;
    const attachmentCount = card?.badges?.attachments;

    return (
        <Popover
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            sx={{
                '& .MuiPaper-root': {
                    borderRadius: 2,
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
                },
            }}
        >
            <Box sx={{ p: 2, width: 300 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" component="div">
                        Sao chép thẻ
                    </Typography>
                    <IconButton
                        aria-label="close"
                        onClick={handleClose}
                        size="small"
                        disabled={isSubmitting}
                    >
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <TextField
                    autoFocus
                    margin="dense"
                    id="name"
                    label="Tên"
                    type="text"
                    fullWidth
                    variant="outlined"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    sx={{ mb: 2 }}
                    disabled={isSubmitting}
                />

                <Typography variant="subtitle2" color="text.secondary" mb={1}>
                    Giữ...
                </Typography>
                <Box sx={{ ml: 1, mb: 2 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={keepItems.checklists}
                                onChange={() => handleKeepItemChange('checklists')}
                                color="primary"
                                size="small"
                                disabled={isSubmitting}
                            />
                        }
                        label={<Typography variant="body2">Danh sách công việc ({checklistCount})</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={keepItems.labels}
                                onChange={() => handleKeepItemChange('labels')}
                                color="primary"
                                size="small"
                                disabled={isSubmitting}
                            />
                        }
                        label={<Typography variant="body2">Nhãn ({labelCount})</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={keepItems.attachments}
                                onChange={() => handleKeepItemChange('attachments')}
                                color="primary"
                                size="small"
                                disabled={isSubmitting}
                            />
                        }
                        label={<Typography variant="body2">Tệp đính kèm ({attachmentCount})</Typography>}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={keepItems.dates}
                                onChange={() => handleKeepItemChange('dates')}
                                color="primary"
                                size="small"
                                disabled={isSubmitting}
                            />
                        }
                        label={<Typography variant="body2">Ngày</Typography>}
                    />
                </Box>

                <Typography variant="subtitle1" gutterBottom>
                    Sao chép tới...
                </Typography>

                <FormControl fullWidth margin="dense" size="small">
                    <InputLabel id="board-select-label" sx={{ color: 'secondary.main' }}>
                        Bảng thông tin
                    </InputLabel>
                    <Select
                        labelId="board-select-label"
                        id="board-select"
                        value={board}
                        label="Bảng thông tin"
                        onChange={handleBoardChange}
                        variant="outlined"
                        disabled={!boards.length || isSubmitting}
                    >
                        {boards.length ? (
                            boards.map((b) => (
                                <MenuItem key={b.id} value={b.id}>
                                    {b.name} {b.id === boardId ? '(hiện tại)' : ''}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem value="" disabled>
                                Không có bảng nào
                            </MenuItem>
                        )}
                    </Select>
                </FormControl>

                <Box display="flex" gap={2} mb={2}>
                    <FormControl fullWidth margin="dense" size="small">
                        <InputLabel id="list-select-label" sx={{ color: 'secondary.main' }}>
                            Danh sách
                        </InputLabel>
                        <Select
                            labelId="list-select-label"
                            id="list-select"
                            value={list}
                            label="Danh sách"
                            onChange={handleListChange}
                            variant="outlined"
                            disabled={!lists.length || (board !== boardId && remoteListsLoading) || isSubmitting}
                        >
                            {lists.length ? (
                                lists.map((l) => (
                                    <MenuItem key={l.id} value={l.id}>
                                        {l.name} {l.id === card?.list_board_id ? '(hiện tại)' : ''}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem value="" disabled>
                                    Không có danh sách nào
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>

                    <FormControl sx={{ width: 80 }} margin="dense" size="small">
                        <InputLabel id="position-select-label" sx={{ color: 'secondary.main' }}>
                            Vị trí
                        </InputLabel>
                        <Select
                            labelId="position-select-label"
                            id="position-select"
                            value={position}
                            label="Vị trí"
                            onChange={handlePositionChange}
                            variant="outlined"
                            disabled={!list || (board !== boardId && remoteListsLoading) || isSubmitting}
                        >
                            {(() => {
                                const cardsInList = getCardsInSelectedList();
                                const cardCount = cardsInList.length;
                                return Array.from({ length: Math.max(1, cardCount + 1) }, (_, i) => (
                                    <MenuItem key={i + 1} value={`${i + 1}`}>
                                        {i + 1}
                                    </MenuItem>
                                ));
                            })()}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', height: 36 }}>
                    {isSubmitting ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                            <LogoLoading />
                        </Box>
                    ) : (
                        <>
                            <Button onClick={handleClose} sx={{ mr: 1 }}>
                                Hủy
                            </Button>
                            <Button
                                onClick={handleCopyCard}
                                variant="contained"
                                disabled={copyCardLoading || !board || !list || !name}
                            >
                                Sao chép
                            </Button>
                        </>
                    )}
                </Box>
            </Box>
        </Popover>
    );
});

export default CopyCardPopUp;