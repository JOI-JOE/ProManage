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
  const { boardId } = useBoard();
  const [open, setOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isArchived, setIsArchived] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);
  const [currentCardId, setCurrentCardId] = useState(card?.id);
  const [description, setDescription] = useState(""); // State for description
  const [isUpdatingCheckbox, setIsUpdatingCheckbox] = useState(false); // New loading state
  const { members } = useBoard();
  const { refetchListData } = useBoard();
  const { updateIsCompleted, updateIsArchived, isUpdating } = useUpdateCardById(currentCardId, boardId);

  // Default badges object with completed_at
  const defaultBadges = {
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
    checklistDue: null,
    checklistDueTime: null,
    completed_at: null,
  };

  const [badges, setBadges] = useState(defaultBadges);

  const labels = [];

  const labelTagRef = useRef(null);

  useEffect(() => {
    if (card?.id) {
      setCurrentCardId(card.id);
    }
  }, [card?.id]);

  useEffect(() => {
    if (!card) return;

    const cardBadges = card.badges || defaultBadges;

    setIsChecked(cardBadges.dueComplete || false);
    setIsArchived(card.is_archived || false);
    setThumbnailUrl(card.thumbnail || null);
    // Only update description if it has changed to prevent flicker
    if (card.description !== description) {
      setDescription(card.description || "");
    }

    setBadges({
      attachments: cardBadges.attachments || 0,
      comments: cardBadges.comments || 0,
      checkItems: cardBadges.checkItems || 0,
      checkItemsChecked: cardBadges.checkItemsChecked || 0,
      description: cardBadges.description || false,
      due: cardBadges.due || null,
      dueTime: cardBadges.dueTime || null,
      dueComplete: cardBadges.dueComplete || false,
      dueReminder: cardBadges.dueReminder || null,
      start: cardBadges.start || null,
      checklistDue: cardBadges.checklistDue || null,
      checklistDueTime: cardBadges.checklistDueTime || null,
      completed_at: cardBadges.completed_at || null,
    });
  }, [card]);

  useEffect(() => {
    if (card?.thumbnail !== thumbnailUrl) {
      setThumbnailUrl(card?.thumbnail || null);
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
    setIsUpdatingCheckbox(true); // Set loading state
    try {
      // Optimistically update badges
      const optimisticBadges = {
        ...badges,
        dueComplete: newChecked,
        completed_at: newChecked ? new Date().toISOString() : null,
      };
      setBadges(optimisticBadges);

      // Make API call
      const response = await updateIsCompleted(newChecked);
      const updatedBadges = {
        ...badges,
        dueComplete: newChecked,
        completed_at: newChecked ? response?.data?.badges?.completed_at || new Date().toISOString() : null,
      };
      setBadges(updatedBadges);
    } catch (err) {
      // Revert on error
      setIsChecked(!newChecked);
      setBadges({
        ...badges,
        dueComplete: !newChecked,
        completed_at: null,
      });
      console.error("Failed to update completion status:", err);
    } finally {
      setIsUpdatingCheckbox(false); // Clear loading state
      // Delay refetch to reduce flicker
      setTimeout(async () => {
        await refetchListData();
      }, 100);
    }
  };

  const handleArchiveCard = async () => {
    setIsArchived(true);
    setSnackbarOpen(true);
    try {
      await updateIsArchived(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (err) {
      setIsArchived(false);
      setSnackbarOpen(false);
    } finally {
      await refetchListData();
    }
  };

  const handleUndoArchive = async () => {
    try {
      await updateIsArchived(false);
      await new Promise((resolve) => setTimeout(resolve, 6000));
      setSnackbarOpen(false);
    } catch (err) {
      setIsArchived(true);
      console.error("Failed to undo archive:", err);
    } finally {
      await refetchListData();
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
    id: currentCardId,
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

  const formatDateRange = (start, due) => {
    if (!start || !due) return null;
    const startDate = new Date(start);
    const dueDate = new Date(due);
    const formatOptions = { day: "numeric", month: "short" };
    const startFormatted = startDate.toLocaleDateString("vi-VN", formatOptions);
    const dueFormatted = dueDate.toLocaleDateString("vi-VN", formatOptions);
    return `${startFormatted} - ${dueFormatted}`;
  };

  const formatCompletedAt = (completedAt) => {
    if (!completedAt) return "";
    const date = new Date(completedAt);
    return date.toLocaleString("vi-VN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const dueDateRange = formatDateRange(badges.start, badges.due);

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
          borderRadius: "9px",
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
          {isChecked && (
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
                  width: "100%",
                  height: "130px",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#f0f0f0",
                  borderTopLeftRadius: "9px",
                  borderTopRightRadius: "9px",
                }}
              >
                <LazyLoadImage
                  src={thumbnailUrl}
                  alt="Card Cover"
                  effect="blur"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderTopLeftRadius: "9px",
                    borderTopRightRadius: "9px",
                  }}
                  key={thumbnailUrl}
                />
              </Box>
            )}
            <CardContent
              sx={{
                padding: "8px",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box onClick={(e) => e.stopPropagation()}>
                <LabelTag ref={labelTagRef} cardId={currentCardId} labels={labels} />
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {(isHovered || isChecked) && (
                  <Checkbox
                    size="small"
                    checked={isChecked}
                    onChange={handleCheckboxChange}
                    disabled={isUpdatingCheckbox}
                    sx={{
                      position: "relative",
                      padding: 0,
                      color: "#0C66E4",
                      "&.Mui-checked": {
                        color: "#0C66E4",
                      },
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
                <Typography variant="h6" gutterBottom sx={{ flex: 1, py: 0.5 }}>
                  {card?.title || "Untitled Card"}
                </Typography>
              </Box>

              {/* Display Completion Time */}
              {isChecked && badges.completed_at && (
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: "0.75rem",
                    color: "text.secondary",
                    marginBottom: 1,
                  }}
                >
                  Hoàn thành: {formatCompletedAt(badges.completed_at)}
                </Typography>
              )}

              <Box
                sx={{
                  padding: "0 4px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1.5,
                    alignItems: "center",
                  }}
                >
                  {(badges.start || badges.due) && (
                    <Box
                      sx={(theme) => {
                        const now = new Date();
                        const due = badges.due ? new Date(badges.due) : null;
                        const timeDiff = due ? due.getTime() - now.getTime() : null;
                        const hoursLeft = timeDiff ? timeDiff / (1000 * 60 * 60) : null;

                        let bgColor = "transparent";
                        let textColor = "white";

                        if (badges.dueComplete) {
                          bgColor = theme.alert.success;
                        } else if (due && due < now) {
                          bgColor = theme.alert.danger;
                        } else if (hoursLeft && hoursLeft <= 24) {
                          bgColor = theme.alert.warning;
                        } else {
                          bgColor = theme.palette.grey[300];
                          textColor = "black";
                        }

                        return {
                          backgroundColor: bgColor,
                          color: textColor,
                          padding: "4px 8px",
                          borderRadius: "8px",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        };
                      }}
                    >
                      <CardMetaItem
                        icon={<AccessTimeRoundedIcon sx={{ fontSize: 16 }} />}
                        text={
                          dueDateRange ||
                          (badges.due
                            ? new Date(badges.due).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "short",
                            })
                            : badges.start
                              ? new Date(badges.start).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "short",
                              })
                              : "")
                        }
                        tooltip={`Hạn chót: ${dueDateRange ||
                          (badges.due
                            ? new Date(badges.due).toLocaleDateString("vi-VN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                            : badges.start
                              ? new Date(badges.start).toLocaleDateString("vi-VN", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })
                              : "")
                          }`}
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

                  {/* {card?.description != null && (
                    <CardMetaItem
                      icon={<NotesIcon sx={{ fontSize: 16 }} />}
                      tooltip="Có mô tả"
                    />
                  )} */}
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
                      <InitialsAvatar
                        key={member.id}
                        initials={member.initials}
                        name={member.full_name}
                        avatarSrc={member.image}
                      />
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