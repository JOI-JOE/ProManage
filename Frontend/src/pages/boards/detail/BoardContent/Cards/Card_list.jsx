import { Box } from "@mui/material";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import C_ard from "./C_ard";

const Card_list = ({ cards }) => {
    return (
        <SortableContext
            items={cards?.map((c) => c.id)}
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
                    <div key={`card-id-${card.id}`}>
                        <C_ard key={card.id} card={card} />
                    </div>
                ))}
            </Box>

        </SortableContext >
    );
};

export default Card_list;
