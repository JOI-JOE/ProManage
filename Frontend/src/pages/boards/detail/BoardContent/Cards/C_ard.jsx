import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
    Dialog,
    Box,
    Tooltip
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import CheckBoxOutlinedIcon from "@mui/icons-material/CheckBoxOutlined"; // Icon checklist
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DescriptionIcon from '@mui/icons-material/Description';
import CardModal from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import { useCardLabels } from "../../../../../hooks/useLabel";
import { useCardById } from "../../../../../hooks/useCard";
import { useCommentsByCard } from "../../../../../hooks/useComment";


const C_ard = ({ card }) => {
    // console.log(card.labels);
    // console.log(card.checklists);
    const {
        data: cardDetail,
        isLoading,
        error,
        updateDescriptionCard,
      } = useCardById(card.id);
    const { data: cardLabels = [] } = useCardLabels(card.id);
    const { data: comments = [] } = useCommentsByCard(card.id);
    console.log(cardDetail);
    const [open, setOpen] = useState(false); // State mở/đóng Dialog
    const navigate = useNavigate(); // Điều hướng URL
    const location = useLocation(); // Lấy URL hiện tại
    const { cardId } = useParams();

    const handleOpen = () => {
        setOpen(true);
        navigate(`c/${card.id}/${card.title.replace(/\s+/g, "-")}`, {
            replace: false,
            state: { background: location.pathname } // Lưu lại trang trước khi mở modal
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
    } = useSortable({ id: card.id, data: { ...card } }); //id: là của thư viện, id:là của DB

    const cardStyle = {
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : undefined,
        border: isDragging ? "1px solid #2ecc71" : undefined,
    };

    const showCardActions = () => {

        return (
            !!card?.memberIds?.length ||
            !!comments?.length ||
            !!card?.attachments?.length ||
            !!cardDetail?.description ||
            !!card?.checklists?.some(checklist => checklist.items.length > 0)

        );
    };

    const allChecklistsCompleted = card?.checklists?.every((checklist) =>
        checklist.items.every((item) => item.is_completed)
    );
    return (
        <>
            <Card  // Sử dụng index làm key (không khuyến khích nếu thứ tự thay đổi)
                ref={setNodeRef}
                style={cardStyle}
                {...attributes}
                {...listeners}
                onClick={handleOpen}
                sx={{
                    cursor: "pointer",
                    boxShadow: "0 1px 1px rgba(0,0,0,0.2)",
                    overflow: "unset",
                    display: card?.FE_PlaceholderCard ? "none" : "block",
                }}
            >
                {card?.cover && <CardMedia sx={{ height: 140 }} image={card?.cover} />}

                {/* {card?.labels?.length > 0 && (
                    <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap", mt: 1 }}>
                        {card.labels.map((label, index) => (
                            <Box
                                key={index}
                                sx={{
                                    backgroundColor: label.color,
                                    padding: "2px 8px",
                                    borderRadius: "4px",
                                    fontSize: "0.65rem",
                                    color: "white",
                                }}
                            >
                                {label.text}
                            </Box>
                        ))}
                    </Box>
                )} */}


                <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
                    {cardLabels?.length > 0 && (
                        <Box sx={{ display: "flex", gap: "4px", flexWrap: "wrap", mb: 1 }}>
                            {cardLabels?.map((label, index) => (
                                <Tooltip key={index} title={label.title || 'No text'}> {/* Hiển thị text khi di chuột qua */}
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
                    )}

                    <Typography sx={{ fontSize: "0.7rem" }}>{cardDetail?.title}</Typography>
                </CardContent>

                {showCardActions() && (
                    <CardActions sx={{
                        p: "0 4px 8px 15px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px", // Điều chỉnh khoảng cách giữa các icon
                    }}>
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
                            <Tooltip title={'Thẻ này có mô tả'}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <DescriptionIcon sx={{ fontSize: 16, color: "primary.dark" }} />
                                </Box>
                            </Tooltip>

                        )}



                        {!!comments?.length && (
                            <Tooltip title={'Bình luận'}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                                    <CommentIcon sx={{ fontSize: 16, color: "primary.dark" }} />
                                    <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "primary.dark" }}>
                                        {comments?.length}
                                    </Typography>
                                </Box>
                            </Tooltip>

                        )}


                        {!!card?.checklists?.some((checklist) => checklist.items.length > 0) && (
                            <Tooltip title={'Mục trong danh sách công việc'}>
                                <Box sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                    backgroundColor: allChecklistsCompleted ? "primary.dark" : "transparent", // Màu nền xanh khi hoàn thành
                                    color: allChecklistsCompleted ? "white" : "primary.dark", // Màu chữ trắng khi hoàn thành
                                    padding: "4px 8px", // Thêm padding để làm nổi bật
                                    borderRadius: "4px", // Bo góc
                                }}>
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
                                        {card?.checklists.reduce(
                                            (total, checklist) => total + checklist.items.filter((item) => item.is_completed).length,
                                            0
                                        )}
                                        /
                                        {card?.checklists.reduce((total, checklist) => total + checklist.items.length, 0)}
                                    </Typography>
                                </Box>
                            </Tooltip>

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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <CardModal card={card} closeDetail={handleClose} />
            </Dialog>
            <Outlet />
        </>
    );
};

export default C_ard;
