import { Avatar, AvatarGroup, Box, Button, Chip, Tooltip } from "@mui/material";
// import React from 'react'
import LockOpenIcon from "@mui/icons-material/LockOpen";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import BoltIcon from "@mui/icons-material/Bolt";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import Right from "../Right";

const style = {
  border: "none",
  fontWeight: "bold",
  borderRadius: "8px",
  fontSize: "14px",

  color: "#ffffff",
  ":hover": { backgroundColor: "" },
  "& .MuiSvgIcon-root": {
    fontSize: "20px",
    color: "#ffffff",
  },
};

const BoardBar = () => {
  return (
    <Box
      sx={{
        backgroundColor: "primary.main",
        height: (theme) => theme.trello.boardBarHeight,
        display: "flex",
        alignItems: "center",
        borderBottom: "2px solid #808e9b",
        justifyContent: "space-between",
        gap: 2,
        overflowX: "auto",
        "&::-webkit-scrollbar-track": {
          m: 2,
        },
      }}
    >
      <Box px={1} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <Chip label="WD-51" sx={style} />
        <Chip
          icon={<LockOpenIcon />}
          label="Khả năng xem"
          variant="outlined"
          clickable
          sx={style}
        />
        <Chip
          icon={<StarBorderIcon />}
          label="Đánh dấu sao"
          variant="outlined"
          clickable
          sx={style}
        />
        <Chip
          icon={<BoltIcon />}
          label="Tự động hóa"
          variant="outlined"
          clickable
          sx={style}
        />
        <Chip
          icon={<FilterListIcon />}
          label="Lọc bảng"
          variant="outlined"
          clickable
          sx={style}
        />
      </Box>
      <Box sx={{ display: "flex", alignItems: "center", paddingX: 2 }}>
        <AvatarGroup
          max={5}
          sx={{
            paddingX: "8px",
            "& .MuiAvatar-root": {
              height: "30px",
              width: "30px",
              fontSize: "16px",
            },
          }}
        >
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://preview.redd.it/ovfk3xy2o4q51.jpg?width=640&crop=smart&auto=webp&s=37b436dadb6283e9fafc0053bbaf44f737fe7b82"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJNffhE-2IRnlQ5P-43AtsQEy8yiJnnglJBw&s"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmyPS0TN6aIto3w_ndOpmfpjz8qbftut6bjWlE5-1s2IrrqK7OL2zqSiS3U84QH8KhW3E&usqp=CAU"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://upanh123.com/wp-content/uploads/2021/05/hinh-nen-doremon2-683x1024.jpg"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://ichef.bbci.co.uk/images/ic/480xn/p09f3ldp.jpg.webp"
            />
          </Tooltip>
          <Tooltip title="Tooltip">
            <Avatar
              alt=""
              src="https://genk.mediacdn.vn/2016/6-1476522724062.jpg"
            />
          </Tooltip>
        </AvatarGroup>
        <Button
          variant="contained"
          startIcon={<PersonAddAltIcon />}
          sx={{
            color: "white",
            backgroundColor: "primary.dark",
            fontSize: "0.75rem",
            textTransform: "none",
          }}
        >
          Chia sẻ
        </Button>
        <Right />
      </Box>
    </Box>
  );
};

export default BoardBar;
