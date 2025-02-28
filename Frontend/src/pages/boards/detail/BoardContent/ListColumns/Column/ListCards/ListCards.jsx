import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";
import C_ard from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Link } from "react-router-dom";

const ListCards = React.memo(({ listId, cards }) => {
  // Sắp xếp cards theo vị trí
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => a.position - b.position);
    
  }, [cards]);

  return (
    <SortableContext
      items={sortedCards.map((c) => c.id)}
      strategy={verticalListSortingStrategy}
    >
      <Box
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
            width: "6px", // Giảm kích thước scrollbar
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#888", // Màu của thanh cuộn
            borderRadius: "6px", // Làm thanh cuộn bo tròn
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#555", // Màu khi hover
          },
        }}
      >
         {sortedCards.length === 0 && (
          <Typography color="gray" textAlign="center">
            Chưa có card nào
          </Typography>
        )}

      {sortedCards.map((card) => (
      
      <C_ard 
      key={card.id} // 👈 Đã sửa ở đây
      card={card} 
    />
    
      ))}

    
      </Box>
    </SortableContext>
  );
});

export default ListCards;
