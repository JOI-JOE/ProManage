import { Box } from "@mui/material";
import C_ard from "./Card/Card";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

const ListCards = ({ cards }) => {
  return (
    <SortableContext
      items={cards?.map((c) => c._id)}
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
        {cards?.map((card) => (
          <C_ard key={card._id} card={card} />
        ))}
      </Box>
    </SortableContext>
  );
};

export default ListCards;
