import React from "react";
import {
  ListItem,
  ListItemIcon,
  Checkbox,
  ListItemText,
  IconButton,
  Avatar,
  Box,
  Typography,
} from "@mui/material";
import AccessTime from "@mui/icons-material/AccessTime";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import {
  useGetMemberInCheckListItem,
  useChecklistsItemByDate,
} from "../../../../../../../../../../hooks/useCheckListItem";
import { format } from "date-fns";
import vi from "date-fns/locale/vi";
import { useGetBoardByID } from "../../../../../../../../../../hooks/useBoard";
import { useParams } from "react-router-dom";

const ChecklistItemRow = ({
  item,
  toggleItemCompletion,
  handleEditItem,
  handleSaveItem,
  handleKeyPressItem,
  editingItemId,
  editedItemName,
  setEditedItemName,
  handleMenuOpen,
  setMemberListConfig,
  setDateConfig,
}) => {

  const { boardId } = useParams();

  const { data: checklistItemMembers } = useGetMemberInCheckListItem(item.id); // nếu không phải checklist-item thì trả về rỗng
  // const { data: checklistItem } = useChecklistsItemByCheckListItem(item.id); // nếu không phải checklist-item thì trả về rỗng
  const { data: checklistItemDate = [] } = useChecklistsItemByDate(item.id); // nếu không phải checklist-item thì trả về rỗng
  // const checklistItemEndTime=checklistItemDate.end_date
  const hasMembers = checklistItemMembers?.data?.length > 0;
  const checklistItemEndTime = checklistItemDate.end_date || null;

  const { data: board } = useGetBoardByID(boardId);


  const isBoardClosed = board?.closed;
  // console.log(checklistItemEndTime);

  return (
    <ListItem
      sx={{
        py: 0,
        my: 0,
        minHeight: "32px",
        transition: "background-color 0.3s",
        "&:hover": {
          backgroundColor: "#f5f5f5",
        },
        "&:hover .hover-icon": {
          opacity: 1,
          visibility: "visible",
        },
      }}
      key={item.id}
    >
      <ListItemIcon>
        <Checkbox
          checked={item.is_completed || false}
          onChange={() => toggleItemCompletion(item.id)}
      
        />
      </ListItemIcon>

      {editingItemId === item.id ? (
        <input
          value={editedItemName}
          onChange={(e) => setEditedItemName(e.target.value)}
          onBlur={() => handleSaveItem(item.id)}
          onKeyDown={(e) => handleKeyPressItem(e, item.id)}
          autoFocus
          style={{ flex: 1 }}
        />
      ) : (
        <ListItemText
          primary={item.name}
          onClick={() => handleEditItem(item.id, item.name)}
          sx={{
            cursor: "pointer",
            textDecoration: item.is_completed ? "line-through" : "none",
          }}
        />
      )}

      <Box
        sx={{ display: "flex", alignItems: "center" }}
      >
        {checklistItemEndTime ? (
          <Typography variant="caption"
          disabled={isBoardClosed}
            sx={{ cursor: "pointer",  pointerEvents: isBoardClosed ? "none" : "auto" }}
            onClick={() => {
              setDateConfig({
                open: true,
                type: "checklist-item",
                targetId: item.id,
              });
            }}>

            {format(new Date(checklistItemEndTime), "dd 'thg' MM", {
              locale: vi,
            })}
          </Typography>
        ) : (
          <IconButton
            onClick={() => {
              setDateConfig({
                open: true,
                type: "checklist-item",
                targetId: item.id,
              });
            }}
            disabled={isBoardClosed}
            sx={{
              ml: 0.5,
              opacity: hasMembers ? 1 : 0,
              visibility: hasMembers ? "visible" : "hidden",
              transition: "all 0.3s",
              pointerEvents: isBoardClosed ? "none" : "auto"
            }}
            className="hover-icon"
          >
            <AccessTime sx={{ fontSize: "16px", mr: 0.5 }} />
          </IconButton>
        )}

        {hasMembers ? (
          checklistItemMembers.data.map((member) => (
            <IconButton
              key={member.id}
              disabled={isBoardClosed}
              onClick={() =>
                setMemberListConfig({
                  open: true,
                  type: "checklist-item",
                  targetId: item.id,
                })
              }
              sx={{ ml: 0.5, p: 0 }}
            >
              <Avatar
                sx={{
                  bgcolor: "teal",
                  width: 22,
                  height: 22,
                  fontSize: 10,
                }}
              >
                {member.full_name
                  ? member.full_name.charAt(0).toUpperCase()
                  : "?"}
              </Avatar>
            </IconButton>
          ))
        ) : (
          <IconButton
          disabled={isBoardClosed}
            onClick={() =>
              setMemberListConfig({
                open: true,
                type: "checklist-item",
                targetId: item.id,
              })
            }
            sx={{
              ml: 0.5,
              opacity: 0,
              visibility: "hidden",
            }}
            className="hover-icon"
          >
            <PersonAddIcon />
          </IconButton>
        )}

        {/* MoreVertIcon luôn hiển thị */}
        <IconButton
          onClick={(e) => handleMenuOpen(e, item.id)}
          sx={{ ml: 0.5 }}
        >
          <MoreVertIcon />
        </IconButton>
      </Box>
    </ListItem>
  );
};

export default React.memo(ChecklistItemRow);
