import React, { useState } from 'react'
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Avatar, Typography, Collapse } from '@mui/material'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

import ViewKanbanIcon from '@mui/icons-material/ViewKanban'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import ViewStreamIcon from '@mui/icons-material/ViewStream'
import PeopleIcon from '@mui/icons-material/People'
import SettingsIcon from '@mui/icons-material/Settings'
import AddIcon from '@mui/icons-material/Add'
import { Link } from 'react-router-dom'
import WorkspaceAvatar from '../../Common/WorkspaceAvatar';



const WorkspaceMenu = ({ workspace }) => {
  const token = localStorage.getItem("token");



  const [openSettings, setOpenSettings] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)


  const toggleSettings = ({ workspace }) => {
    setOpenSettings(!openSettings)
  }

  const handleMouseEnter = (item) => {
    setHoveredItem(item)
  }

  const handleMouseLeave = () => {
    setHoveredItem(null)
  }


  return (
    <div id="workspace-main">
      <ListItemButton key="workspace-item" onClick={toggleSettings} sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ListItemIcon sx={{ color: "black" }}>
            <WorkspaceAvatar workspace={workspace} />
          </ListItemIcon>
          <ListItemText
            primary={
              <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap", color: "black" }}>
                {workspace.display_name.length > 15 ? workspace.display_name.substring(0, 15) + "..." : workspace.display_name}
              </Typography>
            }
          />
        </Box>

        {openSettings ? (
          <ExpandLess sx={{ color: "black" }} />
        ) : (
          <ExpandMore sx={{ color: "black" }} />
        )}
      </ListItemButton>

      <Collapse in={openSettings} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 4 }}>
          <List>
            <ListItemButton component={Link} to={`/w/${workspace?.id}`}>
              <ListItemIcon sx={{ color: "black" }}>
                <ViewKanbanIcon />
              </ListItemIcon>
              <ListItemText primary="Bảng" sx={{ color: "black" }} />
            </ListItemButton>


            <ListItemButton
              omponent={Link} to={`/w/${workspace?.id}/table-view`}
              onMouseEnter={() => handleMouseEnter("Hình")}
              onMouseLeave={handleMouseLeave}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <ViewStreamIcon />
              </ListItemIcon>
              <ListItemText primary="Hình" sx={{ color: "black" }} />
              {hoveredItem === "Hình" && (
                <ChevronRightIcon sx={{ color: "gray" }} />
              )}
            </ListItemButton>

            <ListItemButton
              omponent={Link} to={`/w/${workspace?.id}/members`}
              onMouseEnter={() => handleMouseEnter("Thành viên")}
              onMouseLeave={handleMouseLeave}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary="Thành viên" sx={{ color: "black" }} />
              {hoveredItem === "Thành viên" && (
                <ChevronRightIcon sx={{ color: "gray" }} />
              )}
            </ListItemButton>

            <ListItemButton
              omponent={Link} to={`/w/${workspace?.id}/account`}
              onMouseEnter={() => handleMouseEnter("Cài đặt")}
              onMouseLeave={handleMouseLeave}
            >
              <ListItemIcon sx={{ color: "black" }}>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Cài đặt" sx={{ color: "black" }} />
              {hoveredItem === "Cài đặt" && (
                <ChevronRightIcon sx={{ color: "gray" }} />
              )}
            </ListItemButton>
          </List>
        </Box>
      </Collapse>
    </div>
  )

}

export default WorkspaceMenu