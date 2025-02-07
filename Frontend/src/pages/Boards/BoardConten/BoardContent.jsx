import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";

const BoardContent = () => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        height: (theme) => theme.trello.boardContentHeight,
        p: "18px 0 7px 0px",
      }}
    >
      <ListColumns />
    </Box>
  );
};

export default BoardContent;
