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

const C_ard = ({ card }) => {
  const showCardActions = () => {
    return (
      !!card?.memberIds?.length ||
      !!card?.comments?.length ||
      !!card?.attachments?.length
    );
  };
  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
        overflow: "unset",
      }}
    >
      {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} />}

      <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
        <Typography sx={{ fontSize: "0.78rem" }}>{card?.title}</Typography>
      </CardContent>

      {showCardActions() && (
        <CardActions sx={{ p: "0 4px 8px 4px" }}>
          {!!card?.memberIds?.length && (
            <Button
              size="small"
              startIcon={<GroupIcon />}
              sx={{ fontSize: "0.7rem", color: "primary.dark" }}
            >
              {card?.memberIds?.length}
            </Button>
          )}

          {!!card?.comments?.length && (
            <Button
              size="small"
              startIcon={<CommentIcon />}
              sx={{ fontSize: "0.7rem", color: "primary.dark" }}
            >
              {card?.comments?.length}
            </Button>
          )}

          {!!card?.attachments?.length && (
            <Button
              size="small"
              startIcon={<AttachmentIcon />}
              sx={{ fontSize: "0.7rem", color: "primary.dark" }}
            >
              {card?.attachments?.length}
            </Button>
          )}
        </CardActions>
      )}
    </Card>
  );
};

export default C_ard;
