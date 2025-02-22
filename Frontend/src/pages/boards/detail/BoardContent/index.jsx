import { Box } from "@mui/material";
import { DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ListColumns from "./ListColumns/ListColumns";
// import { useLists } from "../../../../hooks/useList"; // Sử dụng hook useLists
import { useLists } from "../../../../hooks/useList";

const BoardContent = () => {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const { data: lists, isLoading, error, reorderLists } = useLists(boardId);

  console.log("🛠 list:", lists);

  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;
  if (!lists || lists.length === 0) return <p>Không có danh sách nào.</p>;

  // Kết thúc kéo một phần tử
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = lists.findIndex((list) => list.id === Number(active.id));
    const newIndex = lists.findIndex((list) => list.id === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedLists = arrayMove(lists, oldIndex, newIndex);

    // Cập nhật cache ngay lập tức (Optimistic Update)
    queryClient.setQueryData(["boardLists", boardId], updatedLists);

    const updatedPositions = updatedLists.map((list, index) => ({
      id: list.id,
      position: index + 1,
    }));

    console.log("🛠 Gửi lên API:", { board_id: boardId, positions: updatedPositions });

    // Gửi yêu cầu cập nhật lên server mà không cần đợi
    reorderLists({ boardId, updatedPositions })
      .then(() => {
        console.log("✅ Cập nhật vị trí thành công");
      })
      .catch((error) => {
        console.error("❌ Lỗi cập nhật vị trí:", error);
      });
  };
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "18px 0 7px 0px",
        }}
      >
        <ListColumns lists={lists} />
      </Box>
    </DndContext>
  );
};

export default BoardContent;