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
  CardActionArea,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import NotesIcon from '@mui/icons-material/Notes';
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"; // Icon checklist
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CardModal from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import { LazyLoadImage } from "react-lazy-load-image-component";
// import { useCardLabels } from "../../../../../hooks/useLabel";
// import { useCardById, useGetMemberInCard } from "../../../../../hooks/useCard";
// import { useCommentsByCard } from "../../../../../hooks/useComment";
// import { useChecklistsByCard } from "../../../../../hooks/useCheckList";
// import useAttachments from "../../../../../hooks/useAttachment";
// import { LazyLoadImage } from "react-lazy-load-image-component";

const CardMetaItem = ({ icon, text, tooltip }) => {
  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        color: "#637087",
        fontSize: "10px",
      }}
    >
      {icon}
      <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
        {text}
      </Typography>
    </Box>
  );

  return tooltip ? <Tooltip title={tooltip}>{content}</Tooltip> : content;
};


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

  // const handleOpen = () => {
  //   setOpen(true);
  //   navigate(`c/${card.id}/${card.title.replace(/\s+/g, "-")}`, {
  //     replace: false,
  //     state: { background: location.pathname }, // Lưu lại trang trước khi mở modal
  //   });
  // };

  const handleClose1 = () => {
    setOpen(false);
    const pathSegments = location.pathname.split("/");
    const newPath = `/${pathSegments[1]}/${pathSegments[2]}/${pathSegments[3]}`;
    navigate(newPath, { replace: true });
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
  //     // !!card?.memberIds?.length ||
  //     !!comments?.length ||
  //     !!attachments?.data?.length ||
  //     !!cardDetail?.description ||
  //     !!checklists?.some((checklist) => checklist.items.length > 0) ||
  //     !!members?.length
  //   );
  // };

  // const allChecklistsCompleted = checklists?.every(
  //   (checklist) => checklist.items?.every((item) => item.is_completed) ?? false
  // );

  return (
    <>
      <Card
        ref={setNodeRef}
        style={cardStyle}
        {...attributes}
        {...listeners}
        sx={{
          maxWidth: 260,
          borderRadius: '9px',
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
          overflow: "hidden", // Thay đổi từ "unset" sang "hidden"
          display: card?.FE_PlaceholderCard ? "none" : "block",
          ":hover": {
            outline: "2px solid #0C66E4",
          },
        }}
      >
        <Box
          component="div"
          onClick={(e) => {
            if (!e.defaultPrevented) {
              handleOpen();
            }
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          <CardActionArea>
            {/* Thêm Box wrapper với borderRadius để làm mềm góc ảnh */}
            {/* <Box
              sx={{
                width: '100%',
                height: '159.828px',
                overflow: 'hidden',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f0f0f0',
                borderTopLeftRadius: '9px', // Thêm bo góc phía trên
                borderTopRightRadius: '9px', // Thêm bo góc phía trên
              }}
            >
              <LazyLoadImage
                // src="https://i.pinimg.com/736x/46/72/4b/46724b52751a9bbcbb8343ea6c377850.jpg"
                alt="Card Cover"
                effect="blur"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // Thay đổi từ 'contain' sang 'cover' để đảm bảo ảnh phủ đầy không gian
                  borderTopLeftRadius: '9px', // Thêm bo góc phía trên
                  borderTopRightRadius: '9px', // Thêm bo góc phía trên
                }}
              />
            </Box> */}
            <CardContent
              sx={{
                padding: '8px',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="h6" gutterBottom>
                {card?.title}
              </Typography>
              <Box
                sx={{
                  padding: '0 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1
                }}
              >
                {/* Checklist*/}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center'
                  }}
                >
                  <CardMetaItem
                    icon={<CheckBoxOutlinedIcon sx={{ fontSize: 16 }} />}
                    text="0/5"
                    tooltip="Checklist"
                  />
                  <CardMetaItem
                    icon={<AttachmentIcon sx={{ fontSize: 16 }} />}
                    text="2"
                    tooltip="Các tệp tin đính kèm"
                  />
                  <CardMetaItem
                    icon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                    text="5"
                    tooltip="Bình luận"
                  />
                  <CardMetaItem
                    icon={<NotesIcon sx={{ fontSize: 16 }} />}
                    text="2"
                    tooltip="Thẻ đã có mô tả"
                  />
                </Box>

                {/* Member avatars */}
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "4px",
                    justifyContent: "flex-end",
                  }}
                >
                  {[...Array(5)].map((_, i) => (
                    <Tooltip title="No name" key={i}>
                      <Avatar
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: "0.6rem",
                          bgcolor: "primary.main",
                        }}
                      >
                        HA
                      </Avatar>
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </CardContent>
          </CardActionArea>
        </Box>
      </Card>
      {/* <Dialog open={open} onClose={handleClose1} fullWidth maxWidth="md">
        <CardModal card={card} closeDetail={handleClose1} handleClose1={handleClose1} />
      </Dialog> */}
      < Outlet />
    </>
  );
};

export default C_ard;
