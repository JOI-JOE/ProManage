import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";
import TuneIcon from "@mui/icons-material/Tune";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ExtensionIcon from "@mui/icons-material/Extension";
import LabelIcon from "@mui/icons-material/Label";
import StyleIcon from "@mui/icons-material/Style";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveIcon from "@mui/icons-material/Archive";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";

export default function Right() {
  const [state, setState] = React.useState({ right: false });

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };

  const listItems = [
    { text: "Về bảng này", icon: <InfoIcon /> },
    { text: "Hoạt động", icon: <HistoryIcon /> },
    { text: "Mục đã lưu trữ", icon: <ArchiveIcon /> },
  ];

  const settingsItems = [
    { text: "Cài đặt", icon: <SettingsIcon /> },
    { text: "Thay đổi hình nền", icon: <PaletteIcon /> },
    { text: "Trường tùy chỉnh", icon: <TuneIcon /> },
    { text: "Tự động hóa", icon: <AutoFixHighIcon /> },
    { text: "Tiện ích bổ sung", icon: <ExtensionIcon /> },
    { text: "Nhãn", icon: <LabelIcon /> },
    { text: "Các nhãn dán", icon: <StyleIcon /> },
    { text: "Tạo mẫu", icon: <StyleIcon /> },
  ];

  const actionItems = [
    { text: "Theo dõi", icon: <VisibilityIcon /> },
    { text: "Cài đặt Email-tới-bảng", icon: <EmailIcon /> },
    { text: "Sao chép bảng thông tin", icon: <ContentCopyIcon /> },
    { text: "In, xuất và chia sẻ", icon: <PrintIcon /> },
    { text: "Đóng bảng thông tin", icon: <CloseIcon /> },
  ];

  const drawerList = (anchor) => (
    <Box
      sx={{ width: 280 }}
      role="presentation"
      onClick={toggleDrawer(anchor, false)}
      onKeyDown={toggleDrawer(anchor, false)}
    >
      <List>
        {listItems.map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {settingsItems.map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {actionItems.map(({ text, icon }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer("right", true)} sx={{ color: "white" }}>
        <MoreHorizIcon />
      </Button>
      <Drawer
        sx={{
          "& .MuiPaper-root": {
            top: "48px",
          },
          "& .MuiSvgIcon-root": {
            fontSize: "20px",
            color: "#000000",
          },
          "& .MuiTypography-root": {
            fontSize: "18px",
            color: "#000000",
          },
          "& .MuiListItemButton-root": {
            fontSize: "18px",
            color: "#a5b1c2",
          },
        }}
        anchor="right"
        open={state.right}
        onClose={toggleDrawer("right", false)}
      >
        {drawerList("right")}
      </Drawer>
    </div>
  );
}
