import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Typography,
    Dialog,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams, Outlet } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import CommentIcon from "@mui/icons-material/Comment";
import AttachmentIcon from "@mui/icons-material/Attachment";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
// import CardDetail from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";
import CardModal from "../ListColumns/Column/ListCards/Card/CardDetail/CardDetail";


const C_ard = ({ card }) => {
    // Kéo thả
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
        navigate(-1); // Quay lại trang trước (tốt hơn)
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
            !!card?.comments?.length ||
            !!card?.attachments?.length
        );
    };
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
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <CardModal card={card} closeDetail={handleClose} />
            </Dialog>
            <Outlet />
        </>
    );
};

export default C_ard;
