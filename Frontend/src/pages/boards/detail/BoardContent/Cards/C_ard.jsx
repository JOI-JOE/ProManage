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
  colors,
  useTheme,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import AttachmentIcon from "@mui/icons-material/Attachment";
import NotesIcon from '@mui/icons-material/Notes';
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"; // Icon checklist
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CardModal from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import { LazyLoadImage } from "react-lazy-load-image-component";
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useBoard } from "../../../../../contexts/BoardContext";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar";
import Card_detail from "./Card_detail";

const CardMetaItem = ({ icon, text, tooltip }) => {
  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
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
  const [open, setOpen] = useState(false);
  const { members } = useBoard();


  /// =---------------------------------------------------------------------
  const [badges, setBadges] = useState({
    attachments: 0,
    comments: 0,
    checkItems: 0,
    checkItemsChecked: 0,
    description: false,
    due: null,
    dueTime: null,
    dueComplete: false,
    dueReminder: null,
    start: null
  });

  const membersInCard = useMemo(() => {
    return members.filter(member =>
      card?.membersId?.includes(member.id)
    );
  }, [members, card?.membersId]);

  console.log(membersInCard)

  useEffect(() => {
    if (card?.badges) {
      setBadges({
        attachments: card.badges.attachments || 0,
        comments: card.badges.comments || 0,
        checkItems: card.badges.checkItems || 0,
        checkItemsChecked: card.badges.checkItemsChecked || 0,
        description: card.badges.description || false,
        due: card.badges.due || null,
        dueTime: card.badges.dueTime || null,
        dueComplete: card.badges.dueComplete || false,
        dueReminder: card.badges.dueReminder || null,
        start: card.badges.start || null
      });
    }
  }, [card?.badges]);
  /// =---------------------------------------------------------------------

  // Mở modal
  const handleOpenCard = () => {
    setOpen(true);
  };

  // Đóng modal
  const handleCloseCard = () => {
    setOpen(false);
  };
  ///-----------------------------------------------------------------------------------
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id, data: card,
    disabled: open,
  });

  const cardStyle = {
    transform: transform ? CSS.Translate.toString(transform) : "none",
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
  };


  return (
    <>
      <Card
        ref={setNodeRef}
        style={cardStyle}
        {...attributes}
        {...listeners}
        onClick={handleOpenCard}
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
              handleOpenCard();
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
            {/* {card} */}
            {card?.thumbnail && (
              <Box
                sx={{
                  width: '100%',
                  height: '130px',
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
                  src={card?.thumbnail}
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
              </Box>
            )}
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
                {/* Checklist và các badges khác */}
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center'
                  }}
                >
                  {/* Due date badge - chỉ hiển thị nếu có ngày hết hạn */}
                  {badges.due && (
                    <Box
                      sx={(theme) => {
                        const now = new Date();
                        const due = new Date(badges.due);
                        const timeDiff = due.getTime() - now.getTime();
                        const hoursLeft = timeDiff / (1000 * 60 * 60);

                        let bgColor = 'transparent';
                        let textColor = 'white';

                        if (badges.dueComplete) {
                          bgColor = theme.alert.success; // xanh đậm từ theme
                        } else if (due < now) {
                          bgColor = theme.alert.danger; // đỏ đậm từ theme
                        } else if (hoursLeft <= 24) {
                          bgColor = theme.alert.warning; // vàng đậm từ theme
                        } else {
                          bgColor = theme.palette.grey[300]; // xám nhạt từ theme
                          textColor = 'black'
                        }

                        return {
                          backgroundColor: bgColor,
                          color: textColor,
                          padding: '4px 8px',
                          borderRadius: '8px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        };
                      }}
                    >
                      <CardMetaItem
                        icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
                        text={new Date(badges.due).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                        tooltip={`Hạn chót: ${new Date(badges.due).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}`}
                      />
                    </Box>
                  )}

                  {/* Checklist badge */}
                  {badges.checkItems > 0 && (
                    <CardMetaItem
                      icon={<CheckBoxOutlinedIcon sx={{ fontSize: 16 }} />}
                      text={`${badges.checkItemsChecked}/${badges.checkItems}`}
                      tooltip="Checklist"
                    />
                  )}

                  {/* Attachment badge */}
                  {badges.attachments > 0 && (
                    <CardMetaItem
                      icon={<AttachmentIcon sx={{ fontSize: 16 }} />}
                      text={badges.attachments.toString()}
                      tooltip="Các tệp tin đính kèm"
                    />
                  )}

                  {/* Comment badge */}
                  {badges.comments > 0 && (
                    <CardMetaItem
                      icon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                      text={badges.comments.toString()}
                      tooltip="Bình luận"
                    />
                  )}

                  {/* Description badge - chỉ hiển thị nếu có mô tả */}
                  {badges.description && (
                    <CardMetaItem
                      icon={<NotesIcon sx={{ fontSize: 16 }} />}
                      text=""
                      tooltip="Thẻ đã có mô tả"
                    />
                  )}
                </Box>

                {/* Member avatars - bạn cần thay thế bằng dữ liệu thực tế */}

                {membersInCard.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "4px",
                      justifyContent: "flex-end",
                    }}
                  >
                    {membersInCard.map((member) => (
                      <Tooltip title={member.name || "Không tên"} key={member.id}>
                        <InitialsAvatar
                          key={member.id}
                          initials={member.initials}
                          name={member.user_name}
                          avatarSrc={member.image}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                )}
              </Box>

            </CardContent>
          </CardActionArea>
      </Box>
      </Card>
      <Dialog
        open={open}
        onClose={handleCloseCard}
        fullWidth
        maxWidth="md"
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        disableEnforceFocus={false} // giữ focus trong dialog
        disableEscapeKeyDown={false} // cho phép ESC để đóng
        hideBackdrop={false} // đảm bảo có backdrop
      >
        <Card_detail
          cardId={card?.id}
          closeCard={handleCloseCard}
          openCard={open}
        />
        {/* <CardModal
          cardId={card?.id}
        /> */}
      </Dialog>
    </>
  );
};

export default C_ard;
