import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Link,
  Divider
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useUserWorkspaces } from "../../../../hooks/useWorkspace";
import { useNavigate } from "react-router-dom";

const Activity = () => {

  const { data: workspaces, isLoading, error } = useUserWorkspaces(); 

  const navigate = useNavigate();
  
  const activities = [
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã xoá tập tin đính kèm image.png khỏi",
      target: "adsasd",
      timestamp: "20 phút trước",
      workspace: "trong bảng đã",
      avatar: "CH"
    },
    {
      user: "Chu Van Thai (FPL HN)",
      action: "đã đính kèm tập tin image.png vào thẻ",
      target: "adsasd",
      timestamp: "1 giờ trước",
      workspace: "trong bảng đã",
      avatar: "CH"
    },
    {
      user: "thương thương",
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
      target: "asdasd",
      timestamp: "22:46 8 thg 4, 2023",
      workspace: "trong bảng workspace",
      avatar: "CH"
    },
  ];


  return (
    <Box sx={{ 
      margin: "auto", 
      minHeight: "100vh", 
      backgroundColor: "#fff", 
      maxWidth: "95%" ,
      width: "1200px" 
    }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Workspace section */}
        <Box sx={{ paddingY: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", pl: 2 }}>
            <GroupIcon sx={{ mr: 1, color: "#5E6C84", fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ color: "#5E6C84", fontWeight: 400, fontSize: "0.95rem" }}>
              Các Không gian làm việc
            </Typography>
          </Box>
          
          <List sx={{ padding: 2 }}>
            {isLoading ? (
              <Typography sx={{ pl: 2, fontSize: "0.9rem", color: "#999" }}>Đang tải...</Typography>
            ) : error ? (
              <Typography sx={{ pl: 2, fontSize: "0.9rem", color: "red" }}>Lỗi khi tải workspaces.</Typography>
            ) : (
              workspaces?.map((workspace, index) => (
                <React.Fragment key={workspace.id || index}>
                  <ListItem 
                  onClick={() => navigate(`/w/${workspace.name}/home`)}
                  sx={{ paddingY: 0.7, paddingX: 2 }}>
                    <Typography 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: '#172B4D', 
                        fontSize: "0.9rem",
                        width: "100%",
                        cursor:"pointer",
                        padding: 0.5,
                        textDecoration: "none",
                        "&:hover": {
                          backgroundColor: "#b6c2cf",
                        },
                      }}
                    >
                      {workspace.name}
                      <Box sx={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                        {workspace.permission_level === "private" && (
                          <LockIcon sx={{ fontSize: 14, color: '#e60f0f', ml: 0.5 }} />
                        )}
                        {workspace.permission_level === "public" && (
                          <PublicIcon sx={{ fontSize: 14, color: '#33cc33', ml: 0.5 }} />
                        )}
                        {/* Nếu cần thêm icon khác cho "normal" hay role khác */}
                      </Box>
                    </Typography>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            )}
          </List>

        </Box>

        {/* Activity section */}
        <Box sx={{ paddingY: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", pl: 2, mb: 1 }}>
            <FormatListBulletedIcon sx={{ mr: 1, color: "#5E6C84", fontSize: 20 }} />
            <Typography variant="subtitle1" sx={{ color: "#5E6C84", fontWeight: 400, fontSize: "0.95rem" }}>
              Hoạt động
            </Typography>
          </Box>

          <List sx={{ padding: 0 }}>
            {activities.map((activity, index) => (
              <React.Fragment key={index}>
                <ListItem 
                  sx={{ 
                    paddingY: 1,
                    paddingX: 2,
                    alignItems: "flex-start"
                  }}
                >
                  <ListItemAvatar sx={{ minWidth: 36, mt: 0 }}>
                    <Avatar 
                      sx={{ 
                        width: 28, 
                        height: 28, 
                        fontSize: '0.8rem',
                        bgcolor: activity.avatar === 'CH' ? '#FF5722' : '#3F51B5',
                      }}
                    >
                      {activity.avatar}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText 
                    sx={{ margin: 0, mt: -0.25 }}
                    primary={
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                        <Typography component="span" sx={{ fontWeight: 500, color: '#172B4D', mr: 0.5, fontSize: "0.85rem" }}>
                          {activity.user}
                        </Typography>
                        <Typography component="span" sx={{ color: '#172B4D', mr: 0.5, fontSize: "0.85rem" }}>
                          {activity.action}
                        </Typography>
                        {activity.target2 && (
                          <>
                            <Typography component="span" sx={{ fontWeight: 500, color: '#172B4D', mr: 0.5, fontSize: "0.85rem" }}>
                              {activity.target2}
                            </Typography>
                            <Typography component="span" sx={{ color: '#172B4D', mr: 0.5, fontSize: "0.85rem" }}>
                              {activity.action2}
                            </Typography>
                          </>
                        )}
                        <Link href="#" sx={{ color: '#0052CC', textDecoration: 'none', fontSize: "0.85rem" }}>
                          {activity.target}
                        </Link>
                      </Box>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Typography component="span" sx={{ fontSize: '0.75rem', color: '#5E6C84' }}>
                          {activity.timestamp}
                        </Typography>
                        <Typography component="span" sx={{ fontSize: '0.75rem', color: '#5E6C84', mx: 0.5 }}>
                          •
                        </Typography>
                        <Typography component="span" sx={{ fontSize: '0.75rem', color: '#5E6C84' }}>
                          {activity.workspace}
                        </Typography>
                        {activity.workspace === 'trong bảng đã' && (
                          <Box 
                            component="span" 
                            sx={{ 
                              display: 'inline-block',
                              width: 14, 
                              height: 14, 
                              bgcolor: '#4CAF50', 
                              borderRadius: '50%',
                              ml: 0.5,
                              fontSize: '0.7rem',
                              color: '#fff',
                              textAlign: 'center',
                              lineHeight: '14px'
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
                              width: 14, 
                              height: 14, 
                              bgcolor: '#0079BF', 
                              borderRadius: '50%',
                              ml: 0.5,
                              fontSize: '0.7rem',
                              color: '#fff',
                              textAlign: 'center',
                              lineHeight: '14px'
                            }}
                          >
                            ✓
                          </Box>
                        )}
                      </Box>
                    }
                  />
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default Activity;