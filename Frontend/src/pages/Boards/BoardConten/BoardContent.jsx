import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "../../../../utils/sort";

const BoardContent = ({ board }) => {
  const orderedColumns = mapOrder(board?.columns, board?.columnOrderIds, "_id");
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        height: (theme) => theme.trello.boardContentHeight,
        p: "18px 0 7px 0px",
      }}
    >
      <ListColumns columns={orderedColumns} />
    </Box>
  );
};

export default BoardContent;
