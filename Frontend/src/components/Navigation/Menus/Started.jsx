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
import { useSelector } from "react-redux";

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
  const starredBoards = useSelector((state) => state.starredBoards.starredBoards);
  const boards = useSelector((state) => state.boards.boards)

  const starredBoardDetails = boards
    .filter((board) =>
      starredBoards.some((starredBoard) => starredBoard.board_id === board.id)
    )
    .sort((a, b) => a.position - b.position); // Sắp xếp theo position

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
        {starredBoardDetails.length === 0 ? (
          <MenuItem disabled>Không có bảng nào</MenuItem>
        ) : (
          starredBoardDetails.map((board) => (
            <MenuItem
              component={Link}
              to={`/b/${board.id}/${board.name}`} // Sửa lại đường dẫn
              key={board.id} // Sử dụng idBoard làm key duy nhất
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
                />
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
