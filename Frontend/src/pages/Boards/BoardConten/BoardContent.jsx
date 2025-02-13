import { Box } from "@mui/material";
import ListColumns from "./ListColumns/ListColumns";
import { mapOrder } from "../../../../utils/sort";
import { useParams } from 'react-router-dom';

import { DndContext } from "@dnd-kit/core";
import React, { useState, useEffect } from 'react';
import axios from 'axios';


const BoardContent = () => {
  const [columns, setColumns] = useState([]);
  const { boardId } = useParams();

  useEffect(() => {
    axios.get(`http://127.0.0.1:8000/api/lists/${boardId}`)
      .then(response => {
        // Sắp xếp dựa vào trường position
        const sortedColumns = response.data.sort((a, b) => a.position - b.position);
        setColumns(sortedColumns);
      })
      .catch(error => console.error('Error fetching columns:', error));
  }, [boardId]);

  const handleDragEnd = (event) => {
    console.log("handleDragEnd:", event);
    // Bổ sung logic để xử lý việc thay đổi vị trí của các cột sau khi kéo và thả nếu cần
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
        <ListColumns columns={columns} />
      </Box>
    </DndContext>
  );

};

export default BoardContent;