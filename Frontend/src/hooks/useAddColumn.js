// src/hooks/useAddColumn.js
import { useState } from "react";
import { toast } from "react-toastify";

const useAddColumn = (createList) => {
  const [openColumn, setOpenColumn] = useState(false);
  const [columnName, setColumnName] = useState("");

  const addColumn = async () => {
    if (!columnName.trim()) {
      toast.error("Nhập tên cột");
      return;
    }

    try {
      await createList(columnName);
      setColumnName("");
      setOpenColumn(false);
      toast.success("Thêm cột thành công");
    } catch (error) {
      toast.error("Lỗi khi thêm cột");
      console.error("Lỗi khi thêm cột:", error);
    }
  };

  return {
    openColumn,
    setOpenColumn,
    columnName,
    setColumnName,
    addColumn,
  };
};

export default useAddColumn;
