import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragOverlay,
} from "@dnd-kit/core";
import { useParams } from "react-router-dom";
import BoardBar from "./BoardBar";
import { useLists } from "../../../../hooks/useList";
import Col_list from "./Columns/Col_list";
// import useUpdateCardPosition from "../../../../hooks/useUpdateCardPosition";
import { useUpdateCardPosition } from "../../../../hooks/useCard";
import useDragAndDrop from "../../../../hooks/useDragAndDrop";

const BoardContent = () => {
  const { boardId } = useParams();
  const { data: lists = [], isLoading, error, reorderLists } = useLists(boardId);
  const [orderedLists, setOrderedLists] = useState([]);
  const { updateCardPosition } = useUpdateCardPosition();
  // Sử dụng hook useDragAndDrop
  const { handleDragStart, handleDragEnd, activeItem } = useDragAndDrop(
    orderedLists,
    setOrderedLists,
    boardId,
    reorderLists,
    updateCardPosition // Giả sử bạn đã có hàm updateCardPosition
  );

  useEffect(() => {
    if (lists?.length > 0) {
      setOrderedLists(lists);
    }
  }, [lists]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    })
  );

  return (
    <>
      <BoardBar />
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box
          sx={{
            backgroundColor: "primary.main",
            width: "100%",
            height: "100%",
            p: "10px 0",
            overflowX: "auto",
            overflowY: "hidden",
            "&::-webkit-scrollbar": { height: "8px" },
            "&::-webkit-scrollbar-thumb": { backgroundColor: "#bdc3c7", borderRadius: "8px" },
          }}
        >
          <Col_list lists={orderedLists.length > 0 ? orderedLists : lists} />
        </Box>

        {/* DragOverlay để hiển thị khi kéo thả card */}
        <DragOverlay>
          {activeItem?.type === "card" ? (
            <Box
              sx={{
                backgroundColor: "white",
                padding: "8px",
                borderRadius: "4px",
                boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                cursor: "grabbing",
                position: "absolute",
                zIndex: 1000,
              }}
            >
              <h3>{activeItem.item.title}</h3>
              <p>{activeItem.item.description}</p>
            </Box>
          ) : null}
        </DragOverlay>
      </DndContext>
    </>
  );
};

export default BoardContent;