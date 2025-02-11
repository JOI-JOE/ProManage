import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "../../../../utils/sort";

import { DndContext } from "@dnd-kit/core";

const BoardContent = ({ board }) => {
  const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, "_id");

  const handleDragEnd = (event) => {
    console.log("handleDragEnd:", event);
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          p: "18px 0 7px 0px",
        }}
      >
        <ListColumns columns={orderedColumns} />
      </Box>
    </DndContext>
  );
};

export default BoardContent;
