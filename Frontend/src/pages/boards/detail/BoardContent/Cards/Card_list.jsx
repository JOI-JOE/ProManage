import { Box } from "@mui/material";
import {
    SortableContext,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import C_ard from "./C_ard";
import { CardProvider } from "../../../../../contexts/CardContext";

const Card_list = ({ cards }) => {
    return (
        <SortableContext
            items={cards?.filter((c) => !c.is_archived).map((c) => c.id)} // Chỉ lấy ID của card không archived
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
                        width: "3px", // Giảm kích thước scrollbar
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
                {cards
                    ?.filter((card) => !card.is_archived) // Chỉ hiển thị card không archived
                    .map((card) => (

                        <div key={`card-id-${card.id}`}>
                            <CardProvider card={card}>
                                <C_ard key={card.id} card={card} />
                            </CardProvider>
                        </div>
                    ))}
            </Box>

        </SortableContext >
    );
};

export default Card_list;
