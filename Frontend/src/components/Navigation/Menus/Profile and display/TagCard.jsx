import React, { useState } from "react";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Menu,
  MenuItem,
  Paper
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
// import { useMe } from "../../../../contexts/MeContext";
import { useToggleCardCompletion, useUserBoardCards } from "../../../../hooks/useCard";
import { useUserById } from "../../../../hooks/useUser";
import { useQueryClient } from "@tanstack/react-query";

const TagCard = () => {
  // const { user } = useMe();

  const { data: user, isLoading: isUserLoading } = useUserById();


  const { data: card, isLoading, error } = useUserBoardCards(user?.id);



  const data = card?.cards;
  console.log(data);
  const [checkedItems, setCheckedItems] = useState([]);
  const [hoverRow, setHoverRow] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [listMenuAnchor, setListMenuAnchor] = useState(null);
  const open = Boolean(anchorEl);
  const listMenuOpen = Boolean(listMenuAnchor);
  const queryClient = useQueryClient();


  const [sortOption, setSortOption] = useState("due_date");

  const handleCheckboxChange = (index) => {
    const newCheckedItems = [...checkedItems];
    newCheckedItems[index] = !newCheckedItems[index];
    setCheckedItems(newCheckedItems);
  };

  const handleSortOptionChange = (option) => {
    setSortOption(option);
    handleClose();
  };

  const sortedData = [...(data || [])].sort((a, b) => {
    if (sortOption === "created_at") {
      return new Date(a.created_at) - new Date(b.created_at);
    } else if (sortOption === "due_date") {
      return new Date(a.end_date) - new Date(b.end_date);
    } else if (sortOption === "title") {
      return a.title.localeCompare(b.title);
    }
    return 0;
  });

  const handleSortClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const toggleCompletion = useToggleCardCompletion();



  const handleListClick = (event) => {
    setListMenuAnchor(event.currentTarget);
  };

  const handleListMenuClose = () => {
    setListMenuAnchor(null);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading cards</div>;

  return (
    <Box
      sx={{
        padding: 0,
        backgroundColor: "#ffffff",
        color: "#000000",
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <Box sx={{ width: "80%", maxWidth: "1200px" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", padding: 2, borderBottom: "1px solid #e0e0e0" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              onClick={handleSortClick}
              sx={{
                display: "flex",
                alignItems: "center",
                padding: "6px 12px",
                backgroundColor: "#f5f5f5",
                borderRadius: 1,
                cursor: "pointer"
              }}
            >
              <Typography variant="body2" sx={{ color: "#333", marginRight: 1 }}>
                Sắp xếp theo ngày đến hạn
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" />
            </Box>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
              <MenuItem onClick={() => handleSortOptionChange("created_at")}>Ngày tạo</MenuItem>
              <MenuItem onClick={() => handleSortOptionChange("due_date")}>Ngày đến hạn</MenuItem>
              <MenuItem onClick={() => handleSortOptionChange("title")}>Tên</MenuItem>
            </Menu>
          </Box>

          <Box sx={{ display: "flex" }}>
            <IconButton>
              <FilterListIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#666", marginTop: 1, marginRight: 1 }}>
              Lọc thẻ
            </Typography>
            <IconButton>
              <CloseIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" sx={{ color: "#666", marginTop: 1 }}>
              Xóa bộ lọc
            </Typography>
          </Box>
        </Box>

        <TableContainer component={Paper} sx={{ backgroundColor: "transparent", boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: "#666", borderBottom: "1px solid #e0e0e0", width: "20%" }}>Thẻ</TableCell>
                <TableCell sx={{ color: "#666", borderBottom: "1px solid #e0e0e0", width: "20%" }}>Danh sách</TableCell>
                <TableCell sx={{ color: "#666", borderBottom: "1px solid #e0e0e0", width: "20%" }}>Nhãn</TableCell>
                <TableCell sx={{ color: "#666", borderBottom: "1px solid #e0e0e0", width: "20%" }}>Ngày đến hạn</TableCell>
                <TableCell sx={{ color: "#666", borderBottom: "1px solid #e0e0e0", width: "30%" }}>Bảng thông tin</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedData?.map((item, index) => (
                <TableRow
                  key={item.id}
                  onMouseEnter={() => setHoverRow(index)}
                  onMouseLeave={() => setHoverRow(null)}
                >
                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0", display: "flex", alignItems: "center", padding: "30px" }}>
                    <Checkbox
                      checked={item.is_completed || false}
                      onChange={() => {
                        toggleCompletion.mutate(item.id, {
                          onSuccess: () => {
                            queryClient.invalidateQueries({ queryKey: ["userBoardCards", user?.id], exact: true });

                          },
                        });
                      }}
                      sx={{
                        color: "#999",
                        '&.Mui-checked': {
                          color: "#4CAF50",
                        },
                        padding: "0 10px 0 0"
                      }}
                    />
                    <Typography>{item.title}</Typography>
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    <Typography>{item.list_name}</Typography>
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {Array.isArray(item.labels) && item.labels.map((label, tagIndex) => (
                      <Box
                        key={tagIndex}
                        sx={{
                          display: "inline-block",
                          width: 24,
                          height: 8,
                          backgroundColor: label.color.hex_code,
                          borderRadius: 1,
                          marginRight: 0.5
                        }}
                      />
                    ))}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    {item.end_date ? new Date(item.end_date).toLocaleDateString() : "-"}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "1px solid #e0e0e0" }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Box
                        component="img"
                        src={item.board_thumbnail}
                        alt="thumbnail"
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 1,
                          marginRight: 1,
                          objectFit: "cover",
                          backgroundColor: "#eee"
                        }}
                      />
                      <Box>
                        <Typography variant="body2" fontSize={16}>{item.board_name}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.workspace_name}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}

            </TableBody>
          </Table>
        </TableContainer>

        <Menu anchorEl={listMenuAnchor} open={listMenuOpen} onClose={handleListMenuClose}>
          <MenuItem onClick={handleListMenuClose}>To Do</MenuItem>
          <MenuItem onClick={handleListMenuClose}>Doing</MenuItem>
          <MenuItem onClick={handleListMenuClose}>Done</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default TagCard;
