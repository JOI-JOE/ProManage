import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Typography,
  Dialog,
  Box,
  Tooltip,
  Avatar,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"; // Icon checklist
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DescriptionIcon from "@mui/icons-material/Description";
import CardModal from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
// import { useCardLabels } from "../../../../../hooks/useLabel";
// import { useCardById, useGetMemberInCard } from "../../../../../hooks/useCard";
// import { useCommentsByCard } from "../../../../../hooks/useComment";
// import { useChecklistsByCard } from "../../../../../hooks/useCheckList";
// import useAttachments from "../../../../../hooks/useAttachment";
// import { LazyLoadImage } from "react-lazy-load-image-component";

const C_ard = ({ card }) => {
  // const {
  //   data: cardDetail,
  //   isLoading,
  //   error,
  //   updateDescriptionCard,
  // } = useCardById(card.id);
  // const { data: cardLabels = [] } = useCardLabels(card.id);
  // const { data: comments = [] } = useCommentsByCard(card.id);
  // console.log(cardDetail);
  // const { data: checklists = [], isLoadingChecklist } = useChecklistsByCard(
  //   card.id
  // );

  // const { data: members = [], toggleMember } = useGetMemberInCard(card.id);

  // const {
  //   attachments = [],
  //   addAttachment,
  //   updateAttachment,
  //   removeAttachment,
  // } = useAttachments(card.id);

  // const coverImageAttachment = attachments?.data?.find((file) => file.is_cover);
  // const coverImageBackGround = coverImageAttachment
  //   ? coverImageAttachment.path_url
  //   : null;



  const [open, setOpen] = useState(false); // State mở/đóng Dialog
  const navigate = useNavigate(); // Điều hướng URL
  const location = useLocation(); // Lấy URL hiện tại
  const { cardId } = useParams();

  const handleOpen = () => {
    setOpen(true);
    navigate(`c/${card.id}/${card.title.replace(/\s+/g, "-")}`, {
      replace: false,
      state: { background: location.pathname }, // Lưu lại trang trước khi mở modal
    });
  };

  const handleClose = () => {
    setOpen(false);
    // navigate(-1); // Quay lại trang trước (tốt hơn)
    navigate(location.state?.background || `/boards/${boardId}/board`);
  };

  useEffect(() => {
    if (cardId && cardId === String(card.id)) {
      setOpen(true);
    } else {
      setOpen(false); // Đảm bảo tắt khi không có cardId trong URL
    }
  }, [cardId, card.id]);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, data: card }); // Không cần spread object

  const cardStyle = {
    transform: transform ? CSS.Translate.toString(transform) : "none",
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
  };

  // const showCardActions = () => {
  //   return (
  //     !!card?.memberIds?.length ||
  //     !!comments?.length ||
  //     !!attachments?.data?.length ||
  //     !!cardDetail?.description ||
  //     !!checklists?.some((checklist) => checklist.items.length > 0)
  //   );
  // };

  // const allChecklistsCompleted = checklists?.every(
  //   (checklist) => checklist.items?.every((item) => item.is_completed) ?? false
  // );

  return (
    <>
      <Card // Sử dụng index làm key (không khuyến khích nếu thứ tự thay đổi)
        ref={setNodeRef}
        style={cardStyle}
        {...attributes}
        {...listeners}
        onClick={handleOpen}
        sx={{
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
          overflow: "unset",
          display: card?.FE_PlaceholderCard ? "none" : "block",
          border: "1px solid transparent",
          transition: "border 0.2s ease-in-out, box-shadow 0.2s ease-in-out", // Thêm transition
          ":hover": {
            border: "1px solid #0079bf", // Border màu xanh khi hover (giống Trello)
          },
          // height: "110px"
        }}
      >
        {/* {coverImageBackGround && (
          <CardMedia sx={{ height: 140, mb: 2, justifyContent: "center" }}>
            <LazyLoadImage
              src={coverImageBackGround}
              alt="Card Cover"
              effect="blur" // Hiệu ứng mờ khi tải ảnh
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </CardMedia>
        )} */}

        <CardContent sx={{ p: 1.5, pb: 2, "&:last-child": { p: 1.5 } }}>
          {/* {cardLabels?.length > 0 && (
            <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap", mb: 1 }}>
              {cardLabels?.map((label, index) => (
                <Tooltip key={index} title={label.title || "No text"}>
                  <Box
                    sx={{
                      backgroundColor: label.color.hex_code,
                      height: "8px",
                      width: "40px",
                      borderRadius: "4px",
                    }}
                  />
                </Tooltip>
              ))}
            </Box>
          )} */}

          <Typography sx={{ fontSize: "0.7rem" }}>
            {card?.title}
          </Typography>
        </CardContent>
        {/* 
        {showCardActions() && (
          <CardActions
            sx={{
              p: "0 4px 8px 15px",
              display: "flex",
              alignItems: "center",
              gap: "6px", // Điều chỉnh khoảng cách giữa các icon
              // width: "100%",
              flexWrap: "wrap",
            }}
          >
            {!!card?.memberIds?.length && (
              <Button
                size="small"
                startIcon={<GroupIcon />}
                sx={{ fontSize: "0.65rem", color: "primary.dark" }}
              >
                {card?.memberIds?.length}
              </Button>
            )}

            {!!cardDetail?.description && (
              <Tooltip title={"Thẻ này có mô tả"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <DescriptionIcon
                    sx={{ fontSize: 16, color: "primary.dark" }}
                  />
                </Box>
              </Tooltip>
            )}

            {!!comments?.length && (
              <Tooltip title={"Bình luận"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <CommentIcon sx={{ fontSize: 16, color: "primary.dark" }} />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.75rem", color: "primary.dark" }}
                  >
                    {comments?.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {!!attachments?.data?.length && (
              <Tooltip title={"Các tệp tin đính kèm"}>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <AttachmentIcon
                    sx={{ fontSize: 16, color: "primary.dark" }}
                  />
                  <Typography
                    variant="body2"
                    sx={{ fontSize: "0.75rem", color: "primary.dark" }}
                  >
                    {attachments?.data?.length}
                  </Typography>
                </Box>
              </Tooltip>
            )}

            {!!checklists?.some((checklist) => checklist.items.length > 0) && (
              <Tooltip title={"Mục trong danh sách công việc"}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    backgroundColor: allChecklistsCompleted
                      ? "primary.dark"
                      : "transparent", // Màu nền xanh khi hoàn thành
                    color: allChecklistsCompleted ? "white" : "primary.dark", // Màu chữ trắng khi hoàn thành
                    padding: "4px 8px", // Thêm padding để làm nổi bật
                    borderRadius: "4px", // Bo góc
                  }}
                >
                  <CheckBoxOutlinedIcon
                    sx={{
                      fontSize: 16,
                      // color: allChecklistsCompleted ? "success.main" : "primary.dark", // Đổi màu khi hoàn thành
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      fontSize: "0.75rem",
                      // color: allChecklistsCompleted ? "success.main" : "primary.dark", // Đổi màu khi hoàn thành
                    }}
                  >
                    {checklists.reduce(
                      (total, checklist) =>
                        total +
                        checklist.items.filter((item) => item.is_completed)
                          .length,
                      0
                    )}
                    /
                    {checklists.reduce(
                      (total, checklist) => total + checklist.items.length,
                      0
                    )}
                  </Typography>
                </Box>
              </Tooltip>
            )}
          </CardActions>
        )} */}

        {/* {!!members?.data?.length && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap", // Allow wrapping to the next line
              justifyContent: "flex-end", // Push to the right
              gap: "4px",
              zIndex: 1, // Ensure avatar is on top
              marginTop: "10px",
              padding: "0px 8px 8px 8px",
            }}
          >
            {members?.data?.map((member, index) => (
              <Tooltip key={index} title={member.full_name || "No name"}>
                <Avatar
                  sx={{
                    width: 24,
                    height: 24,
                    fontSize: "0.75rem",
                    bgcolor: "primary.main",
                  }}
                >
                  {member.full_name.charAt(0)}
                </Avatar>
              </Tooltip>
            ))}
          </Box>
        )} */}
      </Card>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <CardModal card={card} closeDetail={handleClose} />
      </Dialog>
      <Outlet />
    </>
  );
};

export default C_ard;
