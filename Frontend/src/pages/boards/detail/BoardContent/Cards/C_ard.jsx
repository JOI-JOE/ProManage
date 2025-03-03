import React, { memo } from "react";
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
} from "@mui/material";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const C_ard = ({ card, isDragging = false }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: card?.id || "default-card", // Đảm bảo id là duy nhất
        data: {
            type: 'card', // Quan trọng: Đảm bảo type là "card"
            card, // Thêm thông tin cần thiết
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1, // Sử dụng isDragging
        cursor: isDragging ? "grabbing" : "grab",
        width: "100%", // Giữ nguyên chiều rộng card trong column
    };

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            data={{ type: 'card' }} // Thêm thuộc tính data để phân biệt card
            sx={{
                cursor: "pointer",
                boxShadow: "0 1px 1px rgba(0, 0, 0, 0.2)",
                overflow: "unset",
                display: card.closed ? "none" : "block",
                "&:hover": {
                    borderColor: (theme) => theme.palette.primary.main,
                },
            }}
        >
            {/* Nội dung card */}
            {card?.cover && (
                <CardMedia
                    sx={{ height: 140, backgroundSize: "cover" }}
                    image={card?.cover}
                />
            )}
            <CardContent sx={{ p: 1.5, "&:last-child": { p: 1.5 } }}>
                <Typography>{card.title}</Typography>
            </CardContent>
        </Card>
    );
};

export default C_ard;