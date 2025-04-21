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
import Email from "./Component_BoardMenu/Email";
import Copy from "./Component_BoardMenu/Copy";
import Print from "./Component_BoardMenu/Print";
import ChangeBackground from "./Component_BoardMenu/ChangeBackground/ChangeBackground";
import LabelList from "./Component_BoardMenu/Label/Label";

const BoardMenu = React.memo(({board}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailAnchorEl, setEmailAnchorEl] = useState(null);
  const [copyOpen, setCopyOpen] = useState(false);
  const [copyAnchorEl, setCopyAnchorEl] = useState(null);
  const [printOpen, setPrintOpen] = useState(false);
  const [printAnchorEl, setPrintAnchorEl] = useState(null);

  const [backgroundOpen, setBackgroundOpen] = useState(false); // Thêm state mới
  const [labelOpen, setLabelOpen] = useState(false);

  const toggleMenu = (open) => () => setMenuOpen(open);
  const toggleDetails = (open) => () => setDetailsOpen(open);
  const toggleActivity = (open) => () => setActivityOpen(open);
  const toggleArchive = (open) => () => setArchiveOpen(open);
  const toggleSettings = (open) => () => setSettingsOpen(open);
  const toggleEmail = (event) => {
    setEmailAnchorEl(event.currentTarget);
    setEmailOpen(true);
  };
  const toggleCopy = (event) => {
    setCopyAnchorEl(event.currentTarget);
    setCopyOpen(true);
  };
  const togglePrint = (event) => {
    setPrintAnchorEl(event.currentTarget);
    setPrintOpen(true);
  };
  const toggleBackground = (open) => () => setBackgroundOpen(open);
  const toggleLabel = (open) => () => setLabelOpen(open);

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
    { text: "Cài đặt", icon: <SettingsIcon />, action: toggleSettings(true) },
   
    {
      text: "Thay đổi hình nền",
      icon: <PaletteIcon />,
      action: toggleBackground(true),
    },
    { text: "Nhãn", icon: <LabelIcon />, action: toggleLabel(true) },
  ];

  const actionItems = [
    { text: "Theo dõi", icon: <VisibilityIcon /> },
    {
      text: "Cài đặt Email-tới-bảng",
      icon: <EmailIcon />,
      action: toggleEmail,
    },
    {
      text: "Sao chép bảng thông tin",
      icon: <ContentCopyIcon />,
      action: toggleCopy,
    },
    { text: "In, xuất và chia sẻ", icon: <PrintIcon />, action: togglePrint },
  ];

  const drawerList = (
    <Box
      sx={{ width: 320 }}
      role="presentation"
      onClick={(e) => e.stopPropagation()}
    >
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
        {actionItems.map(({ text, icon, action }) => (
          <ListItem key={text} disablePadding>
            <ListItemButton onClick={action}>
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
      <Drawer anchor="right" open={menuOpen} onClose={toggleMenu(false)}>
        {drawerList}
      </Drawer>
      <BoardDetailsDrawer board={board} open={detailsOpen} onClose={toggleDetails(false)} />
      <ActivityDrawer open={activityOpen} onClose={toggleActivity(false)} />
      <Archived open={archiveOpen} onClose={toggleArchive(false)} />
      <Setting open={settingsOpen} onClose={toggleSettings(false)} />
      <Email
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        anchorEl={emailAnchorEl}
      />
      <Copy
        open={copyOpen}
        onClose={() => setCopyOpen(false)}
        anchorEl={copyAnchorEl}
        currentWorkspaceId={board?.workspaceId}
      />
      <Print
        open={printOpen}
        onClose={() => setPrintOpen(false)}
        anchorEl={printAnchorEl}
      />
      <ChangeBackground
        open={backgroundOpen}
        onClose={toggleBackground(false)}
      />{" "}
      <LabelList open={labelOpen} onClose={toggleLabel(false)} />
    </div>
  );
});

export default BoardMenu;
