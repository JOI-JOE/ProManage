import { useEffect, useState } from "react";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import axios from "axios";
import { useParams } from "react-router-dom";
import ListColumns from "./ListColumns/ListColumns";

import { Box } from "@mui/material";
import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

const BoardContent = () => {
  const { boardId } = useParams();
  const [lists, setLists] = useState([]);
  const [draggingListId, setDraggingListId] = useState(null);
  const [draggingPosition, setDraggingPosition] = useState(null);

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/lists/${boardId}`)
      .then(response => {
        
        if (Array.isArray(response.data)) {
          setLists(response.data.sort((a, b) => a.position - b.position));
        } else {
          console.error("Lỗi: API không trả về danh sách đúng", response.data);
        }
      })
      .catch(error => console.error("Lỗi khi lấy danh sách:", error));

    // ✅ Kết nối Laravel Echo để nhận realtime
    window.Pusher = Pusher;
    window.Echo = new Echo({
      broadcaster: "pusher",
      key: "011ba3f5ec97a6948d45",
      cluster: "ap1",
      forceTLS: true,
    });

    // 🔥 Nhận sự kiện "list đang kéo"
    window.Echo.channel(`board.${boardId}`).listen(".list.dragging", (event) => {
      console.log("📢 List đang được kéo:", event.draggingListId, "ở vị trí", event.position);

      setLists(prevLists => {
        const updatedLists = [...prevLists];
        const movingList = updatedLists.find(list => list.id === event.draggingListId);
        if (movingList) {
          updatedLists.splice(updatedLists.indexOf(movingList), 1); // Xóa list cũ
          updatedLists.splice(event.position - 1, 0, movingList);  // Chèn vào vị trí mới
        }
        return updatedLists;
      });

      setDraggingListId(event.draggingListId);
      setDraggingPosition(event.position);
    });

    // 🔥 Nhận sự kiện cập nhật danh sách khi thả
    window.Echo.channel(`board.${boardId}`).listen(".list.reordered", (event) => {
      console.log("📢 Realtime update received:", event);
      setLists(event.positions.sort((a, b) => a.position - b.position));
      setDraggingListId(null);
      setDraggingPosition(null);
    });

    return () => {
      window.Echo.leaveChannel(`board.${boardId}`);
    };
  }, [boardId]);

  // const handleDragStart = (event) => {
  //   const activeId = Number(event.active.id);
  //   setDraggingListId(activeId);

  //   axios.post(`http://127.0.0.1:8000/api/lists/dragging`, {
  //     board_id: boardId,
  //     dragging_list_id: activeId,
  //     position: lists.findIndex(list => list.id === activeId) + 1
  //   }).catch(error => console.error("❌ Lỗi gửi trạng thái kéo:", error));
  // };

  // const handleDragOver = (event) => {
  //   const { active, over } = event;
  //   if (!active || !over || active.id === over.id) return;

  //   const newIndex = lists.findIndex((list) => list.id === Number(over.id));

  //   axios.post(`http://127.0.0.1:8000/api/lists/dragging`, {
  //     board_id: boardId,
  //     dragging_list_id: Number(active.id),
  //     position: newIndex + 1
  //   }).catch(error => console.error("❌ Lỗi cập nhật vị trí kéo:", error));
  // };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const oldIndex = lists.findIndex((list) => list.id === Number(active.id));
    const newIndex = lists.findIndex((list) => list.id === Number(over.id));
    if (oldIndex === -1 || newIndex === -1) return;

    const updatedLists = arrayMove(lists, oldIndex, newIndex);
    setLists(updatedLists);
    setDraggingListId(null);
    setDraggingPosition(null);

    const updatedPositions = updatedLists.map((list, index) => ({
      id: list.id,
      position: index + 1,
      // name: list.name,
    }));

    axios.put(`http://127.0.0.1:8000/api/lists/reorder`, {
      board_id: boardId,
      positions: updatedPositions
    }).catch(error => console.error("❌ Lỗi cập nhật vị trí:", error));
  };


  return (
    <DndContext 
      // onDragStart={handleDragStart} 
      // onDragOver={handleDragOver}
      onDragEnd={handleDragEnd} 
      sensors={useSensors(useSensor(MouseSensor), 
      useSensor(TouchSensor))}>

      <Box
        sx={{
          backgroundColor: "primary.main",
          height: (theme) => theme.trello.boardContentHeight,
          padding: "18px 0 7px 0px",
        }}
      >

          <ListColumns lists={lists} draggingListId={draggingListId} draggingPosition={draggingPosition} />
       

      </Box>
    </DndContext>
  );
};

export default BoardContent;




