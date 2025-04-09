import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Typography,
  ListSubheader,
  Box,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { useCardById, useCopyCard } from "../../../../../../../../../../hooks/useCard";
import { useGetUserWorkspaces } from "../../../../../../../../../../hooks/useWorkspace";
import { useGetBoardMembers } from "../../../../../../../../../../hooks/useInviteBoard";
// import { useGetBoardMembers } from "../../../../../../../../../../hooks/useBoard"; // Assume this hook exists or need to be created

const CopyCardModal = ({ open, onClose }) => {
  const { cardId } = useParams();
  const { data: cardDetail, refetch: refetchCardDetail } = useCardById(cardId);
  const { data, error, isLoading, refetch: refetchWorkspaces } = useGetUserWorkspaces();
  const { mutate: copyCardMutate, isLoading: copyingCard } = useCopyCard();

  // Add a hook to get board members


  const [cardName, setCardName] = useState("");
  const [keepChecklist, setKeepChecklist] = useState(true);
  const [keepLabels, setKeepLabels] = useState(true);
  const [keepMembers, setKeepMembers] = useState(true);
  const [keepAttachments, setKeepAttachments] = useState(true);
  const [keepComments, setKeepComments] = useState(true);
  const [selectedBoard, setSelectedBoard] = useState("");
  const [selectedList, setSelectedList] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [shouldFilterMembers, setShouldFilterMembers] = useState(true);


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

  useEffect(() => {
    if (cardDetail?.title) {
      setCardName(cardDetail.title);
    }
  }, [cardDetail]);

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

  // Set initial selectedBoard when data is loaded
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

  // Set initial selectedPosition when positionOptions change
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

  // Modified handleCopy function to filter members
  const handleCopy = () => {  // Add this parameter
    // Get members from card and destination board
    const cardMembers = cardDetail?.members || [];

    // Truy cập đúng cấu trúc dữ liệu của boardMembers
    const destBoardMembers = boardMembers?.data || [];


    // Get the IDs of board members for easier comparison
    const boardMemberIds = destBoardMembers.map(member => member.id);

    // Filter card members to only include those who are also in the destination board
    const filteredMembers = cardMembers
      .filter(member => boardMemberIds.includes(member.id))
      .map(member => member.id);

    // console.log("Filtered members:", filteredMembers);

    const copyData = {
      card_id: cardId,
      title: cardName,
      board_id: selectedBoard,
      list_board_id: selectedList,
      position: selectedPosition,
      keep_checklist: keepChecklist,
      keep_labels: keepLabels,
      keep_members: keepMembers,
      members: keepMembers ? filteredMembers : [], // Nếu không giữ members thì gửi mảng rỗng
      keep_attachments: keepAttachments,
      keep_comments: keepComments,
    };

    console.log("Copy data being sent:", copyData);

    copyCardMutate(copyData, {
      onSuccess: () => {
        onClose();
        refetchWorkspaces();
        refetchCardDetail();
      },
      onError: (error) => {
        console.error("❌ Error copying card:", error);
      }
    });
  };

  // Ẩn dialog vị trí khi thẻ đã lưu trữ
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
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: "center", fontSize: "17px", fontWeight: "bold" }}>
        Sao chép thẻ
      </DialogTitle>
      <DialogContent>
        <Typography sx={{
          fontSize: "14px",
          fontWeight: "500",
          marginBottom: "4px",
          color: "#42526E"
        }}>
          Tên
        </Typography>

        <TextField
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          fullWidth
          variant="outlined"
          sx={{
            marginBottom: "16px",
            "& .MuiOutlinedInput-root": {
              borderRadius: "3px",
            },
          }}
        />
        {(
          cardDetail.checklists?.length > 0 ||
          cardDetail.labels?.length > 0 ||
          cardDetail.members?.length > 0 ||
          cardDetail.attachments?.length > 0 ||
          cardDetail.comments?.length > 0
        ) && (
            <Typography
              sx={{
                fontSize: "14px",
                fontWeight: "500",
                marginBottom: "4px",
                color: "#42526E"
              }}
            >
              Giữ...
            </Typography>
          )}

        <Box sx={{ marginLeft: "10px" }}>
          {cardDetail.checklists?.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={keepChecklist}
                  onChange={(e) => setKeepChecklist(e.target.checked)}
                  sx={{
                    color: "#4C6EF5",
                    '&.Mui-checked': {
                      color: "#4C6EF5",
                    },
                  }}
                />
              }
              label={`Danh sách công việc (${cardDetail.checklists.length})`}
              sx={{
                display: "block",
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#42526E"
                }
              }}
            />
          )}
          {cardDetail.labels?.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={keepLabels}
                  onChange={(e) => setKeepLabels(e.target.checked)}
                  sx={{
                    color: "#4C6EF5",
                    '&.Mui-checked': {
                      color: "#4C6EF5",
                    },
                  }}
                />
              }
              label={`Nhãn (${cardDetail.labels.length})`}
              sx={{
                display: "block",
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#42526E"
                }
              }}
            />
          )}
          {cardDetail.members?.length > 0 && (

            <FormControlLabel
              control={
                <Checkbox
                  checked={keepMembers}
                  onChange={(e) => setKeepMembers(e.target.checked)}
                  sx={{
                    color: "#4C6EF5",
                    '&.Mui-checked': {
                      color: "#4C6EF5",
                    },
                  }}
                />
              }
              label={`Thành viên (${cardDetail.members.length})`}
              sx={{
                display: "block",
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#42526E"
                }
              }}
            />
          )}
          {cardDetail.attachments?.length > 0 && (

            <FormControlLabel
              control={
                <Checkbox
                  checked={keepAttachments}
                  onChange={(e) => setKeepAttachments(e.target.checked)}
                  sx={{
                    color: "#4C6EF5",
                    '&.Mui-checked': {
                      color: "#4C6EF5",
                    },
                  }}
                />
              }
              label={`Tệp đính kèm (${cardDetail.attachments.length})`}
              sx={{
                display: "block",
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#42526E"
                }
              }}
            />
          )}
          {cardDetail.comments?.length > 0 && (

            <FormControlLabel
              control={
                <Checkbox
                  checked={keepComments}
                  onChange={(e) => setKeepComments(e.target.checked)}
                  sx={{
                    color: "#4C6EF5",
                    '&.Mui-checked': {
                      color: "#4C6EF5",
                    },
                  }}
                />
              }
              label={`Nhận xét (${cardDetail.comments.length})`}
              sx={{
                display: "block",
                "& .MuiFormControlLabel-label": {
                  fontSize: "14px",
                  color: "#42526E"
                }
              }}
            />
          )}
        </Box>
        <Typography sx={{
          fontSize: "14px",
          fontWeight: "500",
          marginTop: "16px",
          marginBottom: "4px",
          color: "#42526E"
        }}>
          Sao chép tới...
        </Typography>

        <Typography sx={{
          fontSize: "14px",
          fontWeight: "500",
          marginTop: "16px",
          marginBottom: "4px",
          color: "#42526E"
        }}>
          Bảng thông tin
        </Typography>
        <FormControl fullWidth margin="dense">
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

        <Grid container spacing={2}>
          <Grid item xs={showPositionSelector ? 6 : 12}>
            <Typography sx={{
              fontSize: "14px",
              fontWeight: "500",
              marginBottom: "4px",
              color: "#42526E"
            }}>
              Danh sách
            </Typography>
            <FormControl fullWidth margin="dense" disabled={selectedBoardLists.length === 0}>
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
          </Grid>

          {showPositionSelector && (
            <Grid item xs={6}>
              <Typography sx={{ fontSize: "14px", fontWeight: "500", marginBottom: "4px", color: "#42526E" }}>
                Vị trí
              </Typography>
              <FormControl fullWidth margin="dense" disabled={selectedBoardLists.length === 0}>
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
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleCopy}
          variant="contained"
          disabled={!selectedBoard || !selectedList || !selectedPosition || !cardName || copyingCard}
        >
          {copyingCard ? "Đang tạo..." : "Tạo thẻ"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyCardModal;