import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  Button,
  MenuItem,
  Select,
  FormControl,
  Box,
  Typography,
  IconButton,
  ListSubheader,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useGetUserWorkspaces } from "../../../../../../../../../../hooks/useWorkspace";
import { useCardById, useMoveCard } from "../../../../../../../../../../hooks/useCard";
import { useParams } from "react-router-dom";
import { useGetBoardMembers } from "../../../../../../../../../../hooks/useInviteBoard";

const MoveCardModal = ({ open, onClose }) => {
  const { cardId } = useParams();
  const { data: cardDetail, refetch: refetchCardDetail } = useCardById(cardId);
  const { data, error, isLoading, refetch: refetchWorkspaces } = useGetUserWorkspaces();
  const { mutate: moveCardMutate, isLoading: movingCard } = useMoveCard();
  
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");

  // Lấy danh sách thành viên của board đích
  const { data: boardMembers } = useGetBoardMembers(selectedBoard, {
    enabled: !!selectedBoard && open
  });

  // Refresh data khi mở modal
  useEffect(() => {
    if (open) {
      refetchWorkspaces();
      refetchCardDetail();
    }
  }, [open, refetchWorkspaces, refetchCardDetail]);

  const allBoards = useMemo(() => {
    if (!data) return [];

    const owned = data?.owned_workspaces?.flatMap((ws, wsIndex) =>
      (ws.boards || [])
        .filter(board => board && board.id && board.name && !board.closed)
        .map(board => ({
          ...board,
          workspaceName: ws.name || `Workspace Owned ${wsIndex + 1}`,
          workspaceType: "owned",
        }))
    ) || [];

    const guest = data?.guest_workspaces?.flatMap((ws, wsIndex) =>
      (ws.boards || [])
        .filter(board => board && board.id && board.name && !board.closed)
        .map(board => ({
          ...board,
          workspaceName: ws.name || `Workspace Guest ${wsIndex + 1}`,
          workspaceType: "guest",
        }))
    ) || [];

    return [...owned, ...guest];
  }, [data]);

  const groupedBoards = useMemo(() => {
    const groups = {};
    allBoards.forEach(board => {
      const name = board.workspaceName || "Chưa rõ";
      if (!groups[name]) groups[name] = [];
      groups[name].push(board);
    });
    return groups;
  }, [allBoards]);

  const selectedBoardLists = useMemo(() => {
    const board = allBoards.find(b => b.id === selectedBoard);
    if (!board) return [];
    return (board.lists || []).filter(list => list.closed !== 1);
  }, [selectedBoard, allBoards]);

  const selectedListCards = useMemo(() => {
    const board = allBoards.find(b => b.id === selectedBoard);
    const list = board?.lists?.find(l => l.id === selectedList);

    // Loại bỏ các thẻ đã lưu trữ và CÙNG PHẢI loại bỏ thẻ hiện tại nếu đã lưu trữ
    const cards = (list?.cards || []).filter(card => {
      // Loại bỏ tất cả các thẻ đã lưu trữ
      if (card.is_archived === 1) {
        return false;
      }

      // Nếu là thẻ hiện tại và đã bị lưu trữ từ API, cũng loại bỏ
      if (card.id === cardDetail?.id && cardDetail?.is_archived === 1) {
        return false;
      }

      return true;
    });

    return cards;
  }, [selectedBoard, selectedList, allBoards, cardDetail]);

  const positionOptions = useMemo(() => {
    // Nếu danh sách không có card nào, chỉ hiển thị vị trí 1 với position là 65536
    if (selectedListCards.length === 0) {
      return [{ label: "1", value: "65536.000000" }];
    }

    const positions = selectedListCards
      .map(c => Number(c.position))
      .sort((a, b) => a - b);

    const options = [];

    // Option đầu tiên (trước tất cả các card)
    options.push({
      label: "1",
      value: (positions[0] / 2).toFixed(6)
    });

    // Các option giữa các card
    for (let i = 0; i < positions.length; i++) {
      // Nếu là card cuối cùng
      if (i === positions.length - 1) {
        options.push({
          label: `${i + 2}`,
          value: (positions[i] + 65536).toFixed(6)
        });
      }
      // Nếu không phải card cuối cùng
      else {
        options.push({
          label: `${i + 2}`,
          value: ((positions[i] + positions[i + 1]) / 2).toFixed(6)
        });
      }
    }

    return options;
  }, [selectedListCards]);

  useEffect(() => {
    if (cardDetail && allBoards.length > 0) {
      const exists = allBoards.some(b => b.id === cardDetail.board_id);
      setSelectedBoard(exists ? String(cardDetail.board_id) : "");
    }
  }, [cardDetail, allBoards]);

  // Set initial selectedList when selectedBoard changes
  useEffect(() => {
    if (cardDetail && selectedBoard) {
      const isSameBoard = String(cardDetail.board_id) === selectedBoard;
      if (isSameBoard) {
        setSelectedList(cardDetail.list_id);
      } else if (selectedBoardLists.length > 0) {
        setSelectedList(selectedBoardLists[0].id);
      } else {
        setSelectedList("");
      }
    } else {
      setSelectedList("");
    }
  }, [cardDetail, selectedBoard, selectedBoardLists]);

  useEffect(() => {
    if (positionOptions.length > 0) {
      // Nếu danh sách không có card nào, luôn chọn vị trí 1
      if (selectedListCards.length === 0) {
        setSelectedPosition(positionOptions[0].value); // 65536.000000
      }
      // Nếu danh sách có card và card hiện tại có vị trí và card hiện tại KHÔNG bị lưu trữ
      else if (cardDetail?.position && cardDetail?.is_archived !== 1) {
        // Tìm vị trí của card hiện tại trong danh sách đã sắp xếp
        const sortedCards = [...selectedListCards].sort((a, b) => Number(a.position) - Number(b.position));
        const currentIndex = sortedCards.findIndex(card => card.id === cardDetail.id);

        // Nếu là card đầu tiên, chọn vị trí 1
        if (currentIndex === 0) {
          setSelectedPosition(positionOptions[0].value);
        }
        // Nếu không phải card đầu tiên
        else if (currentIndex > 0) {
          setSelectedPosition(positionOptions[currentIndex].value);
        } else {
          // Mặc định chọn vị trí đầu tiên nếu không tìm thấy card hiện tại
          setSelectedPosition(positionOptions[0].value);
        }
      } else {
        // Mặc định chọn vị trí đầu tiên
        setSelectedPosition(positionOptions[0].value);
      }
    }
  }, [positionOptions, cardDetail, selectedListCards]);

  // Style the select controls to match the image
  const selectStyle = {
    height: "40px",
    fontSize: "14px",
    borderRadius: "4px",
    border: "1px solid #c4c4c4",
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none"
    }
  };

  const labelStyle = {
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
    marginLeft: "2px",
  };

  const handleMove = () => {
    const isCrossBoardMove = String(cardDetail?.board_id) !== selectedBoard;
  
    // Lấy danh sách thành viên từ card hiện tại
    const cardMembers = cardDetail?.members || [];
  
    // Lấy danh sách thành viên của board đích
    const destBoardMembers = boardMembers?.data || [];
    const boardMemberIds = destBoardMembers.map(member => member.id);
  
    // Lọc chỉ những thành viên có mặt trong board đích
    const filteredMembers = cardMembers
      .filter(member => boardMemberIds.includes(member.id))
      .map(member => member.id);
  
    // Tạo payload cho API move
    const moveData = {
      card_id: cardId,
      board_id: selectedBoard,
      list_board_id: selectedList,
      position: selectedPosition,
      // ...(isCrossBoardMove && { members: filteredMembers }) // Gửi members nếu cross-board
    };
  
    console.log("📦 moveData gửi lên:", moveData);
  
    moveCardMutate(moveData, {
      onSuccess: () => {
        onClose();
        refetchWorkspaces();
        refetchCardDetail();
      },
      onError: (error) => {
        console.error("❌ Lỗi khi di chuyển thẻ:", error);
      }
    });
  };
  

  const showPositionSelector = cardDetail?.is_archived !== 1;

  if (isLoading || !data || !cardDetail) {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogContent>
          <Typography>Đang tải dữ liệu...</Typography>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      PaperProps={{
        sx: {
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }
      }}
    >
      {/* Header with title and close button */}
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #f0f0f0"
      }}>
        <Typography sx={{ fontSize: "18px", fontWeight: "600" }}>
          Di chuyển thẻ
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent sx={{ padding: "24px" }}>
        {/* Board selection */}
        <Box sx={{ mb: 3 }}>
          <Typography sx={labelStyle}>
            Chọn đích đến
          </Typography>
          <FormControl fullWidth>
            <Select
              displayEmpty
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
            >
              {Object.entries(groupedBoards).map(([workspaceName, boards]) => [
                <ListSubheader
                  key={workspaceName}
                  sx={{ fontWeight: "bold", backgroundColor: "#fff", fontSize: "0.9rem" }}
                >
                  {workspaceName}
                </ListSubheader>,
                ...boards.map(board => (
                  <MenuItem key={board.id} value={String(board.id)} sx={{ paddingLeft: "24px" }}>
                    {board.name}
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </Box>

        {/* List and Position section */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ width: "65%" }}>
            <Typography sx={labelStyle}>
              Danh sách
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedList}
                onChange={(e) => setSelectedList(e.target.value)}
                displayEmpty
              >
                {selectedBoardLists.length === 0 ? (
                  <MenuItem value="" disabled>
                    Không có danh sách
                  </MenuItem>
                ) : (
                  selectedBoardLists.map(list => (
                    <MenuItem key={list.id} value={list.id}>
                      {list.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ width: "30%" }}>
            <Typography sx={labelStyle}>
              Vị trí
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedPosition || (positionOptions[0]?.value || "")}
                onChange={(e) => setSelectedPosition(e.target.value)}
                displayEmpty
              >
                {positionOptions.map((option, index) => (
                  <MenuItem
                    key={index}
                    value={option.value}
                    selected={index === 0 && selectedPosition === option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Move button */}
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleMove}
            fullWidth
            disabled={!selectedBoard || !selectedList || !selectedPosition || movingCard}
            sx={{
              backgroundColor: "#3b6fd4",
              textTransform: "none",
              fontSize: "14px",
              fontWeight: "normal",
              padding: "10px",
              "&:hover": {
                backgroundColor: "#2d5bb9"
              }
            }}
          >
            {movingCard ? "Đang di chuyển..." : "Di chuyển"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default MoveCardModal;