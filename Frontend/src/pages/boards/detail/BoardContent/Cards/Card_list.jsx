import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import C_ard from "./C_ard";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

const Cart_list = ({ listId, cards, onCardDrop }) => {

    const { setNodeRef, isOver } = useDroppable({
        id: `list-drop-area-${listId}`,
        data: {
            type: 'list-drop-area',
            listId,
        },
        onDrop: (event) => {
            if (onCardDrop) {
                onCardDrop(event.active.data.current, listId);
            }
        },
    });

    const sortedCards = useMemo(() => {
        return [...(cards || [])].sort((a, b) => a.position - b.position);
    }, [cards]);

    return (
        <SortableContext
            items={sortedCards.map((c) => c.id)}
            strategy={verticalListSortingStrategy}
        >
            <Box
                ref={setNodeRef}
                sx={{
                    m: 0.5,
                    p: 0.5,
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    overflowX: "hidden",
                    overflowY: "auto",
                    maxHeight: (theme) =>
                        `calc(
              ${theme.trello.boardContentHeight} -
              ${theme.spacing(5)} -
              ${theme.trello.columnHeaderHeight} -
              ${theme.trello.columnFooterHeight}
            )`,
                    "&::-webkit-scrollbar": {
                        width: "6px",
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#888",
                        borderRadius: "6px",
                    },
                    "&::-webkit-scrollbar-thumb:hover": {
                        backgroundColor: "#555",
                    },
                    minHeight: "5px",
                    transition: "background-color 0.2s ease",
                    backgroundColor: isOver ? "rgba(0, 0, 0, 0.1)" : "transparent"
                }}
            >
                {sortedCards.length === 0 && (
                    <Typography color="gray" textAlign="center" fontSize="0.875rem" py={1}>
                        Chưa có card nào
                    </Typography>
                )}
                {sortedCards.map((card) => (
                    <C_ard
                        key={card.id} card={card} listId={listId} isDragging={false}
                    />
                ))}
            </Box>
        </SortableContext>
    );
};

export default Cart_list;