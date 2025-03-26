import { Box, Button, MenuItem, Avatar, Typography } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useMe } from "../../../contexts/MeContext";
import { useSelector } from "react-redux";
import LogoLoading from "../../LogoLoading";

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
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const { isLoading } = useMe(); // Lấy trạng thái loading từ context
  const starredBoards = useSelector((state) => state.starredBoards.starred);
  const listStar = starredBoards?.board_stars || [];  // Sử dụng mảng rỗng nếu không có dữ liệu

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

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
          // Nếu đang loading, hiển thị LogoLoading
          <MenuItem disabled>
            <LogoLoading scale={0.4} /> {/* Tùy chỉnh scale nếu cần */}
          </MenuItem>
        ) : (!listStar || listStar.length === 0) ? (
          // Nếu board_stars là undefined hoặc không có bảng nào đã đánh dấu sao
          <MenuItem disabled>Không có bảng nào</MenuItem>
        ) : (
          listStar.map((board) => (
            <MenuItem
              component={Link}
              to={`/b/${board.board_id}/${board.name}`} // Đảm bảo sử dụng đúng board id và name
              key={board.star_id} // Sử dụng board_id làm key duy nhất
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
                  src={board.board_thumbnail || ""}
                  alt={board.board_name}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "4px",
                    background: board.board_thumbnail
                      ? board.board_thumbnail.startsWith("#")
                        ? board.board_thumbnail
                        : `url(${board.board_thumbnail}) center/cover no-repeat`
                      : "#1693E1", // Nếu không có ảnh thì sẽ có màu nền mặc định
                  }}
                />
                <Box>
                  <Typography variant="body1" fontWeight={500}>
                    {board.board_name} {/* Sử dụng tên board */}
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
