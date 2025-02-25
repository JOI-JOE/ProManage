import { Box } from "@mui/material";
import { DndContext } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useEffect } from "react";
import ListColumns from "./ListColumns/ListColumns";
import BoardBar from "./BoardBar";
import { useLists } from "../../../../hooks/useList";

const BoardContent = () => {
  const { boardId } = useParams();
  const queryClient = useQueryClient();
  const { data: lists, isLoading, error, reorderLists } = useLists(boardId);

  console.log("🛠 list:", lists);

  // Hàm xử lý kết thúc kéo một phần tử
  const handleDragEnd = useCallback(
    async (event) => {
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

      try {
        await reorderLists({ boardId, updatedPositions });
        console.log("✅ Cập nhật vị trí thành công");
      } catch (error) {
        console.error("❌ Lỗi cập nhật vị trí:", error);
        // Rollback lại cache nếu có lỗi
        queryClient.setQueryData(["boardLists", boardId], lists);
      }
    },
    [boardId, lists, queryClient, reorderLists]
  );

  // Sử dụng useMemo để tối ưu hóa việc trả về dữ liệu
  const memoizedLists = useMemo(() => lists, [lists]);


  if (isLoading) return <p>Đang tải danh sách...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;
  // if (!memoizedLists || memoizedLists.length === 0) return <p>Không có danh sách nào.</p>;

  return (
    <>
      <BoardBar />
      <DndContext onDragEnd={handleDragEnd}>
        <Box
          sx={{
            backgroundColor: "primary.main",
            height: (theme) => theme.trello.boardContentHeight,
            padding: "18px 0 7px 0px",
          }}
        >
          <ListColumns lists={memoizedLists} />
        </Box>
      </DndContext>
    </>
  );
};

export default BoardContent;