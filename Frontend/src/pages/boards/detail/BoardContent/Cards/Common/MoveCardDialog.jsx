import React, { forwardRef, useImperativeHandle, useState, useEffect } from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useBoard } from '../../../../../../contexts/BoardContext';
import { useWorkspace } from '../../../../../../contexts/WorkspaceContext';
import { useParams } from 'react-router-dom';
import { useListByBoardId } from '../../../../../../hooks/useList';
import { useMoveCard } from '../../../../../../hooks/useCard';
import { cloneDeep } from 'lodash';
import { calculateItemPosition } from '../../../../../../../utils/calculateItemPosition';
import LogoLoading from '../../../../../../components/LogoLoading'; // Import LogoLoading component

const MoveCardPopUp = forwardRef(({ card }, ref) => {
    const { boardId } = useParams();
    const { orderedLists, updateOrderedLists } = useBoard();
    const { workspaces, guestWorkspaces } = useWorkspace();

    // Fix: Use moveCard directly from useMoveCard
    const { mutateAsync: moveCard, isLoading: moveCardLoading } = useMoveCard();

    const [open, setOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [board, setBoard] = useState(boardId || '');
    const [list, setList] = useState(card?.list_board_id || '');
    const [position, setPosition] = useState('');
    const [boards, setBoards] = useState([]);
    const [lists, setLists] = useState([]);
    const [remoteListsData, setRemoteListsData] = useState(null);

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
        if (open) {
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
            setBoard(boardId || '');

            if (boardId === board && orderedLists) {
                const currentLists = orderedLists.map((list) => ({
                    id: list.id,
                    name: list.name || 'Danh sách không tên',
                }));
                setLists(currentLists);

                const currentListId = card?.list_board_id || '';
                setList(currentListId);

                const targetList = orderedLists.find((l) => l.id === currentListId);
                if (targetList) {
                    const cardsInList = targetList.cards
                        .filter((c) => !c.FE_PlaceholderCard)
                        .sort((a, b) => a.position - b.position);
                    const currentPosition = cardsInList.findIndex((c) => c.id === card.id) + 1;
                    setPosition(currentPosition.toString());
                } else {
                    setList(currentLists[0]?.id || '');
                    setPosition('1');
                }
            } else {
                setLists([]);
                setList('');
                setPosition('1');
            }
        }
    }, [open, workspaces, guestWorkspaces, orderedLists, boardId, card]);

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
        }
    }, [remoteListsDataFetched, board, boardId]);

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
            const targetList = orderedLists.find((l) => l.id === card?.list_board_id);
            if (targetList) {
                const cardsInList = targetList.cards
                    .filter((c) => !c.FE_PlaceholderCard)
                    .sort((a, b) => a.position - b.position);
                const currentPosition = cardsInList.findIndex((c) => c.id === card.id) + 1;
                setPosition(currentPosition.toString());
            } else {
                setPosition('1');
            }
        } else {
            setLists([]);
            setList('');
            setPosition('1');
        }
    };

    const handleListChange = (event) => {
        setList(event.target.value);
        setPosition('1');
    };

    const handlePositionChange = (event) => {
        setPosition(event.target.value);
    };

    const handleClose = () => {
        setOpen(false);
        setRemoteListsData(null);
    };

    const handleMove = async () => {
        if (!board || !list || !position || !card?.id) {
            console.error("Missing required data for move:", { board, list, position, cardId: card?.id });
            return;
        }
        try {
            handleClose();
            // Get the target list's cards
            const targetList = board === boardId
                ? orderedLists.find(l => l.id === list)
                : remoteListsData?.lists.find(l => l.id === list);

            const cardsInList = board === boardId
                ? (targetList?.cards || []).filter(c => !c.FE_PlaceholderCard).sort((a, b) => a.position - b.position)
                : (remoteListsData?.cards || []).filter(c => c.list_board_id === list).sort((a, b) => a.position - b.position);

            // Calculate the new position using calculateItemPosition function
            const selectedIndex = parseInt(position) - 1; // Convert to 0-based index
            const newPosition = calculateItemPosition(selectedIndex, cardsInList, card);

            await moveCard({
                cardId: card.id,
                data: {
                    targetListBoardId: list,
                    position: newPosition,
                }
            });
            // Optimistic UI update
            if (board === boardId) {
                updateOrderedLists((prevLists) => {
                    const nextLists = cloneDeep(prevLists);
                    const sourceList = nextLists.find((l) => l.id === card.list_board_id);
                    const targetList = nextLists.find((l) => l.id === list);

                    if (!sourceList || !targetList) {
                        console.error("Source or Target list not found:", { sourceList, targetList });
                        return prevLists;
                    }

                    // Remove card from source list
                    sourceList.cards = sourceList.cards.filter((c) => c.id !== card.id);

                    // Add card to target list with new position
                    const updatedCard = {
                        ...card,
                        list_board_id: list,
                        position: newPosition, // Use the calculated position
                    };

                    targetList.cards = targetList.cards.filter((c) => !c.FE_PlaceholderCard);
                    targetList.cards.push(updatedCard);
                    targetList.cards.sort((a, b) => a.position - b.position);

                    return nextLists;
                });
            } else {
                // Moving to a different board, remove from current board
                updateOrderedLists((prevLists) => {
                    const nextLists = cloneDeep(prevLists);
                    const sourceList = nextLists.find((l) => l.id === card.list_board_id);

                    if (sourceList) {
                        sourceList.cards = sourceList.cards.filter((c) => c.id !== card.id);
                    }

                    return nextLists;
                });
            }
        } catch (error) {
            console.error("MoveCardPopUp - Error moving card:", error);
        }
    };

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
                        Di chuyển thẻ
                    </Typography>
                    <IconButton aria-label="close" onClick={handleClose} size="small">
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                {card && (
                    <Box mb={2}>
                        <Typography variant="subtitle2" color="text.secondary" mb={1}>
                            Đang di chuyển
                        </Typography>
                        <Box display="flex" alignItems="center" bgcolor="#f5f5f5" p={1} borderRadius={1}>
                            <Typography>{card.title || 'Thẻ không có tiêu đề'}</Typography>
                        </Box>
                    </Box>
                )}

                <Typography variant="subtitle1" gutterBottom>
                    Chọn đích đến
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
                        disabled={!boards.length}
                    >
                        {boards.map((board) => (
                            <MenuItem key={board.id} value={board.id}>
                                {board.name} {board.id === boardId ? '(hiện tại)' : ''}
                            </MenuItem>
                        ))}
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
                            disabled={remoteListsLoading || !lists.length}
                        >
                            {lists.map((list) => (
                                <MenuItem key={list.id} value={list.id}>
                                    {list.name} {list.id === card?.list_board_id ? '(hiện tại)' : ''}
                                </MenuItem>
                            ))}
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
                            disabled={remoteListsLoading || !list}
                        >
                            {(() => {
                                const cardsInList = board === boardId
                                    ? (orderedLists.find((l) => l.id === list)?.cards || []).filter((c) => !c.FE_PlaceholderCard)
                                    : (remoteListsData?.cards || []).filter((c) => c.list_board_id === list);
                                const cardCount = cardsInList.length;

                                if (cardCount === 0) {
                                    return [
                                        <MenuItem key={1} value={1}>
                                            1
                                        </MenuItem>,
                                    ];
                                }

                                return Array.from({ length: cardCount + 1 }, (_, i) => (
                                    <MenuItem key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </MenuItem>
                                ));
                            })()}
                        </Select>
                    </FormControl>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={handleClose} sx={{ mr: 1 }}>
                        Hủy
                    </Button>
                    <Button
                        onClick={handleMove}
                        variant="contained"
                        disabled={moveCardLoading || remoteListsLoading || !board || !list || !position || !card?.id}
                        startIcon={moveCardLoading && <LogoLoading size={20} />}
                    >
                        {moveCardLoading ? 'Đang di chuyển...' : 'Di chuyển'}
                    </Button>
                </Box>

                {remoteListsLoading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <LogoLoading size={30} />
                    </Box>
                )}
            </Box>
        </Popover>
    );
});

export default MoveCardPopUp;