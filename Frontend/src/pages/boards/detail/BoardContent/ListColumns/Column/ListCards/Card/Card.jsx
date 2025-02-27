import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from 'react';

const C_ard = ({ card }) => {
  // Kéo thả
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, 
    /// Bản mới
    data: 
    { 
      type:'Card',
      columnId:card.list_board_id,
     ...card 
  
  } 
  /// Bản cũ
//   data: 
//   { 
   
//    ...card 

// } 
  }); //id: là của thư viện, _id:là của DB

  const cardStyle = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : undefined,
    border: isDragging ? "1px solid #2ecc71" : undefined,
  };

  const showCardActions = () => {
    return (
      !!card?.memberIds?.length ||
      !!card?.comments?.length ||
      !!card?.attachments?.length
    );
  };
  return (
    <Card
      ref={setNodeRef}
      style={cardStyle}
      {...attributes}
      {...listeners}
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
        overflow: "unset",
        display: card?.FE_PlaceholderCard ? "none" : "block",
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} />}

      <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
        <Typography sx={{ fontSize: "0.7rem" }}>{card?.title}</Typography>
      </CardContent>

      {showCardActions() && (
        <CardActions sx={{ p: "0 4px 8px 4px" }}>
          {!!card?.memberIds?.length && (
            <Button
              size="small"
              startIcon={<GroupIcon />}
              sx={{ fontSize: "0.65rem", color: "primary.dark" }}
            >
              {card?.memberIds?.length}
            </Button>
          )}

          {!!card?.comments?.length && (
            <Button
              size="small"
              startIcon={<CommentIcon />}
              sx={{ fontSize: "0.65rem", color: "primary.dark" }}
            >
              {card?.comments?.length}
            </Button>
          )}

          {!!card?.attachments?.length && (
            <Button
              size="small"
              startIcon={<AttachmentIcon />}
              sx={{ fontSize: "0.65rem", color: "primary.dark" }}
            >
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

// export default C_ard;
export default memo(C_ard);
