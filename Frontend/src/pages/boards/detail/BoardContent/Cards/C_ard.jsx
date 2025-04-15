import {
  Card,
  CardContent,
  Typography,
  Dialog,
  Box,
  Tooltip,
  CardActionArea,
  Checkbox,
  IconButton,
} from "@mui/material";
import { useState, useEffect, useMemo, useRef } from "react";
import AttachmentIcon from "@mui/icons-material/Attachment";
import NotesIcon from '@mui/icons-material/Notes';
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { LazyLoadImage } from "react-lazy-load-image-component";
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { useBoard } from "../../../../../contexts/BoardContext";
import InitialsAvatar from "../../../../../components/Common/InitialsAvatar";
import Card_detail from "./Card_detail";
import { useUpdateCardById } from "../../../../../hooks/useCard";
import SnackAlert from "./Common/SnackAlert";
import LabelTag from "./ChildComponent/Label/LabelTag";

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
  const [isHovered, setIsHovered] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [currentCardId, setCurrentCardId] = useState(card?.id); // Track the current card ID
  const { members } = useBoard();

  const { updateIsCompleted, updateIsArchived, isUpdating } = useUpdateCardById(currentCardId);

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
    start: null,
  });

  const labels = [
    {
      "id": "label1",
      "name": "High Prioritylkasjlasjfkasjlfjaslkfjaslkfjklfaskjfklasjsấklfjlkasjfklajsklfj",
      "color": "#ff4d4f",
    },
    {
      "id": "label2",
      "name": "In ks",
      "color": "#1890ff",
    },
    {
      "id": "label3",
      "name": "Review",
      "color": "#52c41a",
    }
  ];

  const labelTagRef = useRef(null);

  // Update the currentCardId when card.id changes
  useEffect(() => {
    if (card?.id) {
      setCurrentCardId(card.id);
      console.log(card?.id)
    }
  }, [card?.id, currentCardId]);

  useEffect(() => {
    if (!card) return;

    setIsChecked(card.is_completed || false);
    setIsArchived(card.is_archived || false);
    setThumbnailUrl(card.thumbnail);

    if (card.badges) {
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
        start: card.badges.start || null,
      });
    }
  }, [card]);

  useEffect(() => {
    if (card?.thumbnail !== thumbnailUrl) {
      setThumbnailUrl(card?.thumbnail);
    }
  }, [card?.thumbnail, thumbnailUrl]);

  const membersInCard = useMemo(() => {
    if (!card?.membersId || !Array.isArray(card.membersId)) return [];
    return members.filter((member) => card.membersId.includes(member.id));
  }, [card?.membersId, members]);

  const handleOpenCard = () => {
    if (currentCardId?.startsWith("Optimistic_card_")) {
      return;
    }
    setOpen(true);
  };

  const handleCloseCard = () => {
    setOpen(false);
  };

  const handleCheckboxChange = async (e) => {
    const newChecked = e.target.checked;
    setIsChecked(newChecked);
    try {
      await updateIsCompleted(newChecked);
    } catch (err) {
      setIsChecked(!newChecked);
      console.error("Failed to update completion status:", err);
    }
  };

  const handleArchiveCard = async () => {
    setIsArchived(true);
    setSnackbarOpen(true);
    try {
      await updateIsArchived(true);
    } catch (err) {
      setIsArchived(false);
      setSnackbarOpen(false);
      console.error("Failed to archive card:", err);
    }
  };

  const handleUndoArchive = async () => {
    try {
      await updateIsArchived(false);
      setSnackbarOpen(false);
    } catch (err) {
      setIsArchived(true);
      console.error("Failed to undo archive:", err);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: currentCardId, // Use the currentCardId for drag-and-drop
    data: card,
    disabled: open || currentCardId?.startsWith("Optimistic_card_"),
  });

  const cardStyle = {
    transform: transform ? CSS.Translate.toString(transform) : "none",
    transition: transition || "transform 200ms ease",
    opacity: isDragging ? 0.5 : 1,
    pointerEvents: open ? "none" : "auto",
  };

  if (!card) return null;

  return (
    <>
      <Card
        ref={setNodeRef}
        style={cardStyle}
        {...(open ? {} : { ...attributes, ...listeners })}
        onMouseEnter={() => !isChecked && setIsHovered(true)}
        onMouseLeave={() => !isChecked && setIsHovered(false)}
        sx={{
          maxWidth: 260,
          borderRadius: '9px',
          position: "relative",
          cursor: "pointer",
          boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
          overflow: "hidden",
          display: card?.FE_PlaceholderCard || isArchived ? "none" : "block",
          ":hover": {
            outline: isChecked ? "none" : "2px solid #0C66E4",
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
          {(isChecked) && (
            <Box
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "white",
                borderRadius: "50%",
                zIndex: 1,
              }}
            >
              <Tooltip title="Lưu trữ">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleArchiveCard();
                  }}
                >
                  <Inventory2OutlinedIcon sx={{ fontSize: 16, color: "black" }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          <CardActionArea>
            {thumbnailUrl && (
              <Box
                sx={{
                  width: '100%',
                  height: '130px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: '#f0f0f0',
                  borderTopLeftRadius: '9px',
                  borderTopRightRadius: '9px',
                }}
              >
                <LazyLoadImage
                  src={thumbnailUrl}
                  alt="Card Cover"
                  effect="blur"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderTopLeftRadius: '9px',
                    borderTopRightRadius: '9px',
                  }}
                  key={thumbnailUrl}
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
              <Box
                onClick={(e) => e.stopPropagation()} // Stop propagation for the label section
              >
                <LabelTag ref={labelTagRef} cardId={currentCardId} labels={labels} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {(isHovered || isChecked) && (
                  <Checkbox
                    size="small"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    sx={{
                      position: "relative",
                      padding: 0,
                      color: "#0C66E4",
                      '&.Mui-checked': {
                        color: "#0C66E4",
                      },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Typography variant="h6" gutterBottom sx={{ flex: 1, py: 0.5 }}>
                  {card?.title}
                </Typography>
              </Box>

              <Box
                sx={{
                  padding: '0 4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
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
                          bgColor = theme.alert.success;
                        } else if (due < now) {
                          bgColor = theme.alert.danger;
                        } else if (hoursLeft <= 24) {
                          bgColor = theme.alert.warning;
                        } else {
                          bgColor = theme.palette.grey[300];
                          textColor = 'black';
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

                  {badges.checkItems > 0 && (
                    <CardMetaItem
                      icon={<CheckBoxOutlinedIcon sx={{ fontSize: 16 }} />}
                      text={`${badges.checkItemsChecked}/${badges.checkItems}`}
                      tooltip="Checklist"
                    />
                  )}

                  {badges.attachments > 0 && (
                    <CardMetaItem
                      icon={<AttachmentIcon sx={{ fontSize: 16 }} />}
                      text={badges.attachments}
                      tooltip="Tệp đính kèm"
                    />
                  )}
                  {badges.comments > 0 && (
                    <CardMetaItem
                      icon={<ChatBubbleOutlineIcon sx={{ fontSize: 14 }} />}
                      text={badges.comments}
                      tooltip="Bình luận"
                    />
                  )}

                  {badges.description && (
                    <CardMetaItem
                      icon={<NotesIcon sx={{ fontSize: 16 }} />}
                      tooltip="Có mô tả"
                    />
                  )}
                </Box>

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
                      <Tooltip title={member.name || member.user_name || "Không tên"} key={member.id}>
                        <InitialsAvatar
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
        disableEnforceFocus={false}
        disableEscapeKeyDown={false}
        hideBackdrop={false}
        disablePortal={true}
        sx={{
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <Card_detail
          cardId={currentCardId} 
          closeCard={handleCloseCard}
          openCard={open}
        />
      </Dialog>

      <SnackAlert
        open={snackbarOpen}
        onClose={handleSnackbarClose}
        message="Thẻ đã được lưu trữ."
        onUndo={handleUndoArchive}
        autoHideDuration={7000}
      />
    </>
  );
};

export default C_ard;