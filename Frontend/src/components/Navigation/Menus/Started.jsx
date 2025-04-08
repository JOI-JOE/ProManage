import { Box, Button, MenuItem, Avatar, Typography, SvgIcon, IconButton } from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/material/styles";
import Menu from "@mui/material/Menu";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar } from "@fortawesome/free-solid-svg-icons";
import { useMe } from "../../../contexts/MeContext";
import { useSelector } from "react-redux";
import LogoLoading from "../../LogoLoading";
import LogoBoardStar from "~/assets/boardStar.svg?react"; // Đảm bảo logo SVG được import đúng
import CustomButton from "../../Common/CustomButton";

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
    width: 304, // Match the width from your code and screenshot
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
  const listStar = starredBoards?.board_stars || []; // Sử dụng mảng rỗng nếu không có dữ liệu

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
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 2,
            py: 1,
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              flex: 1,
            }}
          >
            Bảng Đánh Dấu Sao
          </Typography>
          <CustomButton type="close" onClick={handleClose} />

        </Box>

        {
          isLoading ? (
            <MenuItem disabled>
              <LogoLoading scale={0.4} />
            </MenuItem>
          ) : (!listStar || listStar.length === 0) ? (
            <Box sx={{ p: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <SvgIcon
                  component={LogoBoardStar}
                  sx={{
                    width: "100%", // Chiếm toàn bộ chiều rộng của phần tử cha
                    height: "auto", // Giữ tỷ lệ gốc
                  }}
                  viewBox="0 0 24 24"
                  inheritViewBox
                />
              </Box>
              <Typography variant="body2" color="text.secondary" textAlign="center">
                Gắn dấu sao các bảng quan trọng để truy cập nhanh và dễ dàng.
              </Typography>
            </Box>
          ) : (
            listStar.map((board) => (
              <MenuItem
                key={board.star_id} // Sử dụng star_id làm key duy nhất
                onClick={() => {
                  console.log(`Navigate to board ${board.board_id}`); // Replace with your navigation logic
                  handleClose();
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 15px",
                  gap: 2,
                  "&:hover": {
                    backgroundColor: "rgba(0, 0, 0, 0.04)", // Subtle hover effect like Trello
                  },
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
                        : "#1693E1", // Nếu không có ảnh thì sẽ có màu nền mặc định
                    }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={500} color="text.primary">
                      {board.name} {/* Sử dụng tên board */}
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
          )
        }
      </StyledMenu >
    </Box >
  );
};

export default Started;