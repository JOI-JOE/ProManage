import {
  Avatar,
  Box,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useMe } from "../../../contexts/MeContext";

const StyledMenu = styled((props) => (
  <Menu
    elevation={0}
    anchorOrigin={{
      vertical: "bottom",
      horizontal: "center",
    }}
    transformOrigin={{
      vertical: "top",
      horizontal: "center",
    }}
    {...props}
  />
))(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: 6,
    marginTop: theme.spacing(1),
    minWidth: 180,
    color: "rgb(55, 65, 81)",
    boxShadow:
      "rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
  },
}));

const Started = () => {
  const { userDashboard, isLoading, isError } = useMe();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const boardStars = userDashboard?.boardStars || [];

  // Lấy danh sách boards, chuyển thành object { id: { name, ... } }
  const boardsMap = (userDashboard?.boards || []).reduce((acc, board) => {
    acc[board.id] = board; // Map id của board để dễ tìm kiếm
    return acc;
  }, {});

  // Kết hợp boardStars với thông tin của board
  const starredBoards = boardStars.map((star) => ({
    ...star,
    name: boardsMap[star.board_id]?.name || "Không xác định", // Dùng board_id để lấy thông tin
    thumbnail: boardsMap[star.board_id]?.thumbnail || "", // Hình ảnh nếu có
  }));

  console.log(starredBoards);

  return (
    <Box>
      <Button
        id="demo-customized-button-workspace"
        aria-controls={open ? "demo-customized-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
        sx={{ color: "secondary.contrastText" }}
      >
        Đã đánh dấu sao
      </Button>
      <StyledMenu
        id="demo-customized-menu-workspace"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {isLoading ? (
          <MenuItem disabled>
            <CircularProgress size={20} />
            <Typography ml={1}>Đang tải...</Typography>
          </MenuItem>
        ) : isError ? (
          <MenuItem disabled>Lỗi khi tải dữ liệu</MenuItem>
        ) : starredBoards.length === 0 ? (
          <MenuItem disabled>Không có bảng nào</MenuItem>
        ) : (
          starredBoards.map((board) => (
            <MenuItem
              component={Link}
              to={`/b/${board.idBoard}/${board.name}`}
              key={board.id}
              onClick={handleClose}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 15px",
                gap: 2,
              }}
            >
              {/* Bên trái: Avatar + Nội dung */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  src={board.thumbnail || ""}
                  alt={board.name}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "4px",
                    background: board.thumbnail
                      ? board.thumbnail.startsWith("#")
                        ? board.thumbnail
                        : `url(${board.thumbnail}) center/cover no-repeat`
                      : "#1693E1",
                  }}
                >
                  {!board.thumbnail && board.name.charAt(0).toUpperCase()}
                </Avatar>

                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {board.name}
                  </Typography>
                </Box>
              </Box>

              {/* Bên phải: Icon ngôi sao */}
              <FontAwesomeIcon
                icon={faStar}
                style={{ color: "#FFD700", fontSize: 16 }}
              />
            </MenuItem>
          ))
        )}
      </StyledMenu>
    </Box>
  );
};

export default Started;
