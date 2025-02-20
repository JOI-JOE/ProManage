import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import stylesheet của react-quill
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CardActions,
  Divider,
  TextField,
  Grid,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";

const CardDetail = () => {
  const { id } = useParams(); // Lấy ID của thẻ từ URL
  const [card, setCard] = useState(null);
  const [description, setDescription] = useState("");

  useEffect(() => {
    // Giả lập lấy dữ liệu của thẻ từ API
    const fetchCardData = () => {
      const fetchedCard = {
        _id: id,
        title: "Card 2",
        description: "Viết mô tả...",
        activity: "Viết bình luận...",
        members: 3,
        comments: 5,
        attachments: 2,
        date: "2025-02-19",
        customFields: "Trường tùy chỉnh",
      };
      setCard(fetchedCard);
      setDescription(fetchedCard.description);
    };

    fetchCardData();
  }, [id]);

  const handleSave = () => {
    // Xử lý khi lưu thẻ
    console.log("Lưu mô tả mới:", description);
  };

  const handleCancel = () => {
    // Xử lý khi hủy
    console.log("Hủy chỉnh sửa.");
    setDescription(card?.description); // Reset lại mô tả ban đầu
  };

  if (!card) return <div>Đang tải...</div>;

  return (
    <Box sx={{ maxWidth: 1200, margin: "20px auto", padding: 2 }}>
      <Grid container spacing={2}>
        {/* Bên trái - Phần chỉnh sửa mô tả */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h4" gutterBottom>
                {card.title}
              </Typography>
              <ReactQuill
                value={description}
                onChange={setDescription}
                modules={{
                  toolbar: [
                    [{ header: "1" }, { header: "2" }, { font: [] }],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["bold", "italic", "underline"],
                    ["link"],
                    ["blockquote"],
                    [{ align: [] }],
                    ["image", "video"],
                  ],
                }}
                style={{ height: "300px" }}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Bên phải - Các thông tin chi tiết */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              {/* Các nút hành động */}
              <Box sx={{ marginTop: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<GroupIcon />}
                  sx={{ marginBottom: 1 }}
                >
                  {card.members} Thành viên
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<CommentIcon />}
                  sx={{ marginBottom: 1 }}
                >
                  {card.comments} Bình luận
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  startIcon={<AttachmentIcon />}
                  sx={{ marginBottom: 1 }}
                >
                  {card.attachments} Đính kèm
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Các nút Lưu và Hủy */}
          <CardActions>
            <Button
              variant="outlined"
              sx={{ width: "100%" }}
              onClick={handleSave}
            >
              Lưu
            </Button>
            <Button
              variant="outlined"
              sx={{ width: "100%", marginTop: 1 }}
              onClick={handleCancel}
            >
              Hủy
            </Button>
          </CardActions>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CardDetail;
