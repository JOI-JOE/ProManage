import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  Avatar,
  Typography,
  IconButton,
  ListItemButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import { useGetBoardMembers } from "../../../../../../../../../../hooks/useInviteBoard";
import CheckIcon from '@mui/icons-material/Check';
import { useGetMemberInCard } from "../../../../../../../../../../hooks/useCard";
import { useGetMemberInCheckListItem } from "../../../../../../../../../../hooks/useCheckListItem";


const MemberList = ({ open, onClose, type, targetId, onSelectMember }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { boardId, cardId } = useParams();
  const { data: boardMembers } = useGetBoardMembers(boardId)
  const { data: cardMembers } = useGetMemberInCard(cardId);

  // const { data: checklistItemMembers } = useGetMemberInCheckListItem(targetId); // Gọi API để lấy danh sách thành viên trong checklist item

  const { data: checklistItemMembers } = useGetMemberInCheckListItem(
    type === 'checklist-item' ? targetId : null
  );


  // console.log(cardMembers);
  const checkListItemMemberIds = checklistItemMembers?.data?.map((member) => member.id) || [];

  const memberInCardIds = cardMembers?.data?.map((m) => m.id) || [];


  const filteredCardMembers = cardMembers?.data?.filter((member) =>
    member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredBoardMembers = boardMembers?.data
    ?.filter((member) => !memberInCardIds.includes(member.id))
    .filter((member) =>
      member.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  const handleSelectMember = async (userId) => {
    const cardTargetId = type === 'card' ? cardId : targetId;
    await onSelectMember(type, targetId, userId);
    // Nếu type không phải "card" thì mới đóng dialog
    if (type !== 'card') {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ textAlign: "center", fontSize: "17px", fontWeight: "bold" }}
      >
        Thành viên
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder="Tìm kiếm các thành viên"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2, fontSize: "0.7rem" }}
          InputProps={{
            style: { fontSize: "0.7rem" },
          }}
        />
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Thành viên của Thẻ
        </Typography>

        <List>
          {filteredCardMembers.length > 0 ? (
            filteredCardMembers.map((member) => (
              // const isInChecklist = checklistItemMemberIds.includes(member.id);
              <ListItemButton
                key={member.id}
                button
                onClick={() => handleSelectMember(member.id)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // Căn chỉnh tên và biểu tượng tích
                  alignItems: "center", // Căn giữa theo chiều dọc
                }}

              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* <Avatar sx={{ width: 24, height: 24, mr: 2 }}>{member.full_name.charAt(0)}</Avatar> */}
                  <Avatar
                    sx={{
                      bgcolor: "teal",
                      width: 28,
                      height: 28,
                      fontSize: 10,
                      mr: 2
                    }}
                  >
                    {member.full_name
                      ? member.full_name.charAt(0).toUpperCase()
                      : "?"}
                  </Avatar>
                  <Typography sx={{ whiteSpace: "nowrap" }}>{member.full_name.trim()}</Typography>
                </div>
                {checkListItemMemberIds.includes(member.id) && (
                  <CheckIcon sx={{ color: "green", ml: 2 }} />
                )}
              </ListItemButton>
            ))
          ) : (
            <Typography fontSize="0.9rem" sx={{ ml: 1 }}>
              Không có thành viên trong thẻ
            </Typography>
          )}
        </List>
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          Thành viên của Bảng
        </Typography>
        <List>
          {filteredBoardMembers.length > 0 ? (
            filteredBoardMembers.map((member) => (
              <ListItemButton
                key={member.id}
                button
                onClick={() => handleSelectMember(member.id)}
                sx={{
                  display: "flex",
                  justifyContent: "space-between", // Căn chỉnh tên và biểu tượng tích
                  alignItems: "center", // Căn giữa theo chiều dọc
                }}

              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  {/* <Avatar sx={{ width: 24, height: 24, mr: 2 }}>{member.full_name.charAt(0)}</Avatar> */}
                  <Avatar
                    sx={{
                      bgcolor: "teal",
                      width: 28,
                      height: 28,
                      fontSize: 10,
                      mr: 2
                    }}
                  >
                    {member.full_name
                      ? member.full_name.charAt(0).toUpperCase()
                      : "?"}
                  </Avatar>
                  <Typography sx={{ whiteSpace: "nowrap" }}>{member.full_name.trim()}</Typography>
                </div>
                {checkListItemMemberIds.includes(member.id) && (
                  <CheckIcon sx={{ color: "green", ml: 2 }} />
                )}
              </ListItemButton>

            ))
          ) : (
            <Typography fontSize="0.9rem" sx={{ ml: 1 }}>
              Không tìm thấy thành viên nào
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
};

export default MemberList;
