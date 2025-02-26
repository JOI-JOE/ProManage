import React, { useState } from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import SettingsIcon from "@mui/icons-material/Settings";
import PaletteIcon from "@mui/icons-material/Palette";
import LabelIcon from "@mui/icons-material/Label";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EmailIcon from "@mui/icons-material/Email";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PrintIcon from "@mui/icons-material/Print";
import ArchiveIcon from "@mui/icons-material/Archive";
import HistoryIcon from "@mui/icons-material/History";
import InfoIcon from "@mui/icons-material/Info";
import Button from "@mui/material/Button";
import ActivityDrawer from "./Component_BoardMenu/Activity";
import BoardDetailsDrawer from "./Component_BoardMenu/BoardDetailsDrawer";
import Archived from "./Component_BoardMenu/Archive";
import Setting from "./Component_BoardMenu/Setting/Setting";

const BoardMenu = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false); // Thêm state quản lý SettingsDrawer

  const toggleMenu = (open) => () => setMenuOpen(open);
  const toggleDetails = (open) => () => setDetailsOpen(open);
  const toggleActivity = (open) => () => setActivityOpen(open);
  const toggleArchive = (open) => () => setArchiveOpen(open);
  const toggleSettings = (open) => () => setSettingsOpen(open); // Toggle cho SettingsDrawer

  const listItems = [
    { text: "Về bảng này", icon: <InfoIcon />, action: toggleDetails(true) },
    { text: "Hoạt động", icon: <HistoryIcon />, action: toggleActivity(true) },
    {
      text: "Mục đã lưu trữ",
      icon: <ArchiveIcon />,
      action: toggleArchive(true),
    },
  ];

  const settingsItems = [
    { text: "Cài đặt", icon: <SettingsIcon />, action: toggleSettings(true) }, // Gọi toggleSettings
    { text: "Thay đổi hình nền", icon: <PaletteIcon /> },
    { text: "Nhãn", icon: <LabelIcon /> },
  ];

  const actionItems = [
    { text: "Theo dõi", icon: <VisibilityIcon /> },
    { text: "Cài đặt Email-tới-bảng", icon: <EmailIcon /> },
    { text: "Sao chép bảng thông tin", icon: <ContentCopyIcon /> },
    { text: "In, xuất và chia sẻ", icon: <PrintIcon /> },
  ];

  const drawerList = (
    <Box sx={{ width: 280 }} role="presentation" onClick={toggleMenu(false)}>
      <List>
        {listItems.map(({ text, icon, action }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={action}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        {settingsItems.map(({ text, icon, action }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={action}>
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
      <Button onClick={toggleMenu(true)} sx={{ color: "white" }}>
        <MoreHorizIcon />
      </Button>
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={toggleMenu(false)}
        sx={{
          "& .MuiPaper-root": { top: "48px" },
          "& .MuiSvgIcon-root": { fontSize: "20px", color: "#000000" },
          "& .MuiTypography-root": { fontSize: "18px", color: "#000000" },
          "& .MuiListItemButton-root": { fontSize: "18px", color: "#a5b1c2" },
        }}
      >
        {drawerList}
      </Drawer>
      <BoardDetailsDrawer open={detailsOpen} onClose={toggleDetails(false)} />
      <ActivityDrawer open={activityOpen} onClose={toggleActivity(false)} />
      <Archived open={archiveOpen} onClose={toggleArchive(false)} />
      <Setting open={settingsOpen} onClose={toggleSettings(false)} />{" "}
      {/* Thêm SettingsDrawer */}
    </div>
  );
};

export default BoardMenu;
