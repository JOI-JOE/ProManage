import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Tabs,
  Tab,
  Avatar,
  Link
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";

const Activity = () => {
  const [value, setValue] = React.useState(1);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  // Mock data to match the image
  const activities = [
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã xoá tập tin đính kèm image.png khỏi",
      target: "adsasd",
      timestamp: "vừa xong",
      workspace: "trong bảng đã",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã đính kèm tập tin image.png vào thẻ",
      target: "adsasd",
      timestamp: "56 phút trước",
      workspace: "trong bảng đã",
      avatar: "CH"
    },
    {
      user: "theongg thương",
      action: "đã thêm",
      target2: "Chu Van Thai (FPL HN)",
      action2: "vào thẻ",
      target: "adsasd",
      timestamp: "21:31 9 thg 4, 2023",
      workspace: "trong bảng đã",
      avatar: "TT"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã thêm",
      target2: "Thái Chu Văn",
      action2: "vào thẻ",
      target: "adsasd",
      timestamp: "22:46 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã thêm",
      target2: "Thái Chu Văn",
      action2: "vào bảng",
      target: "workspace",
      timestamp: "22:46 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã loại",
      target2: "Thái Chu Văn",
      action2: "khỏi thẻ",
      target: "adsasd",
      timestamp: "22:45 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã tham gia thẻ",
      target: "kasjf",
      timestamp: "22:43 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã thêm",
      target2: "Thái Chu Văn",
      action2: "vào thẻ",
      target: "adsasd",
      timestamp: "22:43 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã thêm",
      target2: "Thái Chu Văn",
      action2: "vào bảng",
      target: "workspace",
      timestamp: "22:43 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã tham gia thẻ",
      target: "adsasd",
      timestamp: "22:43 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    }
  ];

  const workspaces = [
    { name: "sdfjgh", locked: true },
    { name: "ygv", locked: true },
    { name: "zzc", locked: true, group: true }
  ];

  return (
    <Box sx={{color: "#fff", minHeight: "100vh",margin:"auto"}}>
      {/* Content area */}
      <Box sx={{ display: "flex", padding: 2 }}>
        {/* Left sidebar - Workspaces */} 
        <Box sx={{ width: 250, mr: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <GroupIcon sx={{ mr: 1, color: "#999" }} />
            <Typography variant="subtitle1" sx={{ color: "#999" }}>
              Các Không gian làm việc
            </Typography>
          </Box>

          <List sx={{ mb: 4 }}>
            {workspaces.map((workspace, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: 0.5, 
                  color: "#fff",
                }}
              >
                <Typography sx={{ display: 'flex', alignItems: 'center', color: '#bbb' }}>
                  {workspace.name}
                  {workspace.locked && <LockIcon sx={{ ml: 1, fontSize: 16, color: '#888' }} />}
                  {workspace.group && (
                    <GroupIcon sx={{ ml: 1, fontSize: 16, color: '#888' }} />
                  )}
                </Typography>
              </ListItem>
            ))}
          </List>

          <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
            <GroupIcon sx={{ mr: 1, color: "#999" }} />
            <Typography variant="subtitle1" sx={{ color: "#999" }}>
              Hoạt động
            </Typography>
          </Box>
        </Box>

        {/* Main content - Activities */}
        <Box sx={{ flexGrow: 1 }}>
          <List>
            {activities.map((activity, index) => (
              <ListItem 
                key={index} 
                sx={{ 
                  py: 1,
                  alignItems: "flex-start"
                }}
              >
                <ListItemAvatar sx={{ minWidth: 32 }}>
                  <Avatar 
                    sx={{ 
                      width: 32, 
                      height: 32, 
                      fontSize: '0.9rem',
                      bgcolor: activity.avatar === 'CH' ? '#FF5722' : '#3F51B5',
                    }}
                  >
                    {activity.avatar}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText 
                  sx={{ margin: 0 }}
                  primary={
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                      <Typography component="span" sx={{ fontWeight: 500, color: '#fff', mr: 0.5 }}>
                        {activity.user}
                      </Typography>
                      <Typography component="span" sx={{ color: '#bbb', mr: 0.5 }}>
                        {activity.action}
                      </Typography>
                      {activity.target2 && (
                        <>
                          <Typography component="span" sx={{ fontWeight: 500, color: '#fff', mr: 0.5 }}>
                            {activity.target2}
                          </Typography>
                          <Typography component="span" sx={{ color: '#bbb', mr: 0.5 }}>
                            {activity.action2}
                          </Typography>
                        </>
                      )}
                      <Link href="#" sx={{ color: '#5ba4cf', textDecoration: 'none' }}>
                        {activity.target}
                      </Link>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <Typography component="span" sx={{ fontSize: '0.8rem', color: '#999' }}>
                        {activity.timestamp}
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.8rem', color: '#999', mx: 0.5 }}>
                        •
                      </Typography>
                      <Typography component="span" sx={{ fontSize: '0.8rem', color: '#999' }}>
                        {activity.workspace}
                      </Typography>
                      {activity.workspace === 'trong bảng đã' && (
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-block',
                            width: 16, 
                            height: 16, 
                            bgcolor: '#4CAF50', 
                            borderRadius: '50%',
                            ml: 0.5,
                            fontSize: '0.7rem',
                            color: '#fff',
                            textAlign: 'center',
                            lineHeight: '16px'
                          }}
                        >
                          ✓
                        </Box>
                      )}
                      {activity.workspace === 'trong bảng workspace' && (
                        <Box 
                          component="span" 
                          sx={{ 
                            display: 'inline-block',
                            width: 16, 
                            height: 16, 
                            bgcolor: '#2196F3', 
                            borderRadius: '50%',
                            ml: 0.5,
                            fontSize: '0.7rem',
                            color: '#fff',
                            textAlign: 'center',
                            lineHeight: '16px'
                          }}
                        >
                          ✓
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default Activity;