import React, { useEffect } from "react";
import { Box, Container } from "@mui/material";
import { Outlet, useParams } from "react-router-dom";
import SideBar from "./SideBar";
import { BoardProvider, useBoard } from "../../../contexts/BoardContext";
import LogoLoading from "../../../components/LogoLoading";


// Bọc toàn bộ layout bằng Provider
const BoardDetail = () => {
  const { boardId } = useParams();

  // Chỉ render khi đã có boardId
  // if (!boardId) return <LogoLoading />;
  
  return (
    <Container disableGutters maxWidth={false}>
      <BoardProvider>
        <Box
          sx={{
            // backgroundImage: `url(${board?.logo})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <SideBar />
            <Box sx={{ width: "85%" }}>
              <Outlet />
            </Box>
          </Box>
        </Box>
        {/* <BoardLayout /> */}
      </BoardProvider>
    </Container>
  );
};

// const BoardLayout = () => {
//   const { board, setCurrentBoard } = useBoard();
//   const { boardId, boardName } = useParams(); // Lấy boardId và boardName từ URL

//   useEffect(() => {
//     if (boardId && boardName) {
//       setCurrentBoard({ id: boardId, name: boardName });
//     }
//   }, [boardId, boardName, setCurrentBoard]);

//   return (
//     <Box
//       sx={{
//         backgroundImage: `url(${board?.logo})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       <Box sx={{ display: "flex" }}>
//         <SideBar />
//         <Box sx={{ width: "85%" }}>
//           <Outlet />
//         </Box>
//       </Box>
//     </Box>
//   );
// };

export default BoardDetail;
