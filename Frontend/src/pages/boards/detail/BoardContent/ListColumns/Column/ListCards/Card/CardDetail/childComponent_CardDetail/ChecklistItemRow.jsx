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
  const { data: checklistItemMembers } = useGetMemberInCheckListItem(item.id); // nếu không phải checklist-item thì trả về rỗng
  // const { data: checklistItem } = useChecklistsItemByCheckListItem(item.id); // nếu không phải checklist-item thì trả về rỗng
  const { data: checklistItemDate = [] } = useChecklistsItemByDate(item.id); // nếu không phải checklist-item thì trả về rỗng
  // const checklistItemEndTime=checklistItemDate.end_date
  const hasMembers = checklistItemMembers?.data?.length > 0;
  const checklistItemEndTime = checklistItemDate.end_date || null;
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
        onClick={() => {
          setDateConfig({
            open: true,
            type: "checklist-item",
            targetId: item.id,
          });
        }}
      >
        {checklistItemEndTime ? (
          <Typography variant="caption">
            {format(new Date(checklistItemEndTime), "dd 'thg' MM", {
              locale: vi,
            })}
          </Typography>
        ) : (
          <IconButton
            sx={{
              ml: 0.5,
              opacity: hasMembers ? 1 : 0,
              visibility: hasMembers ? "visible" : "hidden",
              transition: "all 0.3s",
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
