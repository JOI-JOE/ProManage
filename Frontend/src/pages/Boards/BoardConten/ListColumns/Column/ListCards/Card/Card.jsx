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

const C_ard = () => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
        overflow: "unset",
      }}
    >
      <CardMedia
        sx={{ height: 140 }}
        image="https://cdn.popsww.com/blog/sites/2/2021/07/phim-hoat-hinh-anime-nhat-ban.jpg"
        title="green iguana"
      />
      <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
        <Typography sx={{ fontSize: "0.94rem" }}>Test</Typography>
      </CardContent>

      <CardActions sx={{ p: "0 4px 8px 4px" }}>
        <Button
          size="small"
          startIcon={<GroupIcon />}
          sx={{ fontSize: "0.7rem", color: "primary.dark" }}
        >
          7
        </Button>
        <Button
          size="small"
          startIcon={<CommentIcon />}
          sx={{ fontSize: "0.7rem", color: "primary.dark" }}
        >
          10
        </Button>{" "}
        <Button
          size="small"
          startIcon={<AttachmentIcon />}
          sx={{ fontSize: "0.7rem", color: "primary.dark" }}
        >
          15
        </Button>
      </CardActions>
    </Card>
  );
};

export default C_ard;
