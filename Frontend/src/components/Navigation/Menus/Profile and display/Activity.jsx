import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Link,
  Divider,
  Modal
} from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import GroupIcon from "@mui/icons-material/Group";
import PublicIcon from "@mui/icons-material/Public";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useUserWorkspaces } from "../../../../hooks/useWorkspace";
import { useNavigate } from "react-router-dom";
import { useActivitiesByUser } from "../../../../hooks/useActivity";
import { formatTime } from "../../../../../utils/dateUtils";

const Activity = () => {

  const { data: workspaces = [], isLoading, error } = useUserWorkspaces();
  const { data: activities = [] } = useActivitiesByUser();

  const [open, setOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleOpen = (imgUrl) => {
    setSelectedImage(imgUrl);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  const navigate = useNavigate();

  return (
    <Box sx={{
      margin: "auto",
      minHeight: "100vh",
      backgroundColor: "#fff",
      maxWidth: "95%",
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
                        cursor: "pointer",
                        padding: 0.5,
                        textDecoration: "none",
                        "&:hover": {
                          backgroundColor: "#e0ebeb",
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
            {activities.map((item, index) => {
              const description = item.description;
              const keyword = "đã";
              const keywordIndex = description.indexOf(keyword);

              if (keywordIndex === -1) return null;

              const userName = description.substring(0, keywordIndex).trim();
              const actionText = description.substring(keywordIndex).trim();
              const affectedUser = item.properties?.full_name;
              const cardName = item.properties?.card_title;
              const cardId = item.properties?.card_id;

              let finalActionText = actionText;

              if (cardName && finalActionText.includes(" này")) {
                finalActionText = finalActionText.replace(" này", ` ${cardName}`);
              }

              if (cardName && !finalActionText.includes(cardName) && !finalActionText.includes("thẻ")) {
                finalActionText += ` thẻ ${cardName}`;
              }

              const renderDescriptionWithLink = (description, filePath, fileName) => {
                const fileIndex = description.indexOf(fileName);
                if (fileIndex === -1) return description;

                const beforeFile = description.slice(0, fileIndex);
                const afterFile = description.slice(fileIndex + fileName.length);
                const isImage = /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);

                return (
                  <>
                    {beforeFile}
                    <span
                      style={{
                        color: "blue",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        if (isImage) {
                          handleOpen(filePath);
                        } else {
                          window.open(filePath, "_blank");
                        }
                      }}
                    >
                      {fileName}
                    </span>
                    {afterFile}
                  </>
                );
              };

              const renderCardNameWithLink = (text) => {
                if (!cardName || !cardId) return text;

                const cardNameIndex = text.indexOf(cardName);
                if (cardNameIndex === -1) return text;

                const beforeCard = text.slice(0, cardNameIndex);
                const afterCard = text.slice(cardNameIndex + cardName.length);

                return (
                  <>
                    {beforeCard}
                    <span
                      style={{
                        color: "blue",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                      onClick={() => navigateToCard(item.properties?.board_id, item.properties?.board_name, cardId)}
                    >
                      {cardName}
                    </span>
                    {afterCard}
                  </>
                );
              };

              const navigateToCard = (boardId, boardName, cardId) => {
                window.open(`/b/${boardId}/${boardName}/c/${cardId}`, "_blank");
              };

              return (
                <Box key={index} display="flex" alignItems="flex-start" mb={1} mt={2} >
                  <Avatar
                    sx={{
                      bgcolor: "pink",
                      width: 28,
                      height: 28,
                      mt: 2,
                      fontSize: '0.8rem',
                      mr: 1.2,
                    }}
                  >
                    {userName.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography>
                      <Typography component="span" fontWeight="bold">
                        {userName}
                      </Typography>{" "}
                      {affectedUser ? (
                        finalActionText.split(affectedUser).map((part, i, arr) => (
                          <React.Fragment key={i}>
                            {renderCardNameWithLink(part)}
                            {i < arr.length - 1 && (
                              <Typography component="span" fontWeight="bold">
                                {affectedUser}
                              </Typography>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <Typography component="span" fontWeight="normal">
                          {(() => {
                            const cardName = item.properties?.card_title;
                            const cardId = item.properties?.card_id;
                            const fileName = item.properties?.file_name;
                            const filePath = item.properties?.file_path;
                            const boardId = item.properties?.board_id;
                            const boardName = item.properties?.board_name;
                            const isImage = fileName && /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(fileName);

                            const linkTargets = [];

                            if (cardName && cardId) {
                              linkTargets.push({
                                text: cardName,
                                render: () => (
                                  <span
                                    style={{ color: "blue", textDecoration: "none", cursor: "pointer" }}
                                    onClick={() =>
                                      window.open(`/b/${boardId}/${boardName}/c/${cardId}`, "_blank")
                                    }
                                  >
                                    {cardName}
                                  </span>
                                ),
                              });
                            }

                            if (fileName && filePath) {
                              linkTargets.push({
                                text: fileName,
                                render: () => (
                                  <span
                                    style={{ color: "blue", textDecoration: "none", cursor: "pointer" }}
                                    onClick={() => {
                                      if (isImage) handleOpen(filePath);
                                      else window.open(filePath, "_blank");
                                    }}
                                  >
                                    {fileName}
                                  </span>
                                ),
                              });
                            }

                            const renderWithLinks = (text) => {
                              if (!linkTargets.length) return text;

                              const elements = [];
                              let remainingText = text;

                              while (remainingText.length > 0) {
                                let matchIndex = -1;
                                let matchedTarget = null;

                                for (const target of linkTargets) {
                                  const index = remainingText.indexOf(target.text);
                                  if (index !== -1 && (matchIndex === -1 || index < matchIndex)) {
                                    matchIndex = index;
                                    matchedTarget = target;
                                  }
                                }

                                if (matchIndex === -1) {
                                  elements.push(remainingText);
                                  break;
                                }

                                if (matchIndex > 0) {
                                  elements.push(remainingText.slice(0, matchIndex));
                                }

                                elements.push(matchedTarget.render());

                                remainingText = remainingText.slice(
                                  matchIndex + matchedTarget.text.length
                                );
                              }

                              return elements;
                            };

                            return renderWithLinks(finalActionText);
                          })()}
                        </Typography>
                      )}
                    </Typography>
                    <Typography fontSize="0.5rem" color="gray">
                      {formatTime(item.created_at)}
                    </Typography>

                    {/* Smaller image display - Modified for Trello-like appearance */}
                    {item.properties?.file_path &&
                      /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(item.properties.file_name) && (
                        <Box 
                          mt={1} 
                          sx={{
                            display: "inline-block",
                            border: "1px solid #dfe1e6",
                            borderRadius: "3px",
                            overflow: "hidden",
                            maxWidth: "300px",
                            height: "260px",
                            cursor: "pointer",
                          }}
                          onClick={() => handleOpen(item.properties.file_path)}
                        >
                          <img
                            src={item.properties.file_path}
                            alt="Attachment"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        </Box>
                      )}
                  </Box>
                </Box>
              );
            })}

            <Modal open={open} onClose={handleClose}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  bgcolor: "background.paper",
                  boxShadow: 24,
                  p: 2,
                  outline: "none",
                }}
              >
                <img
                  src={selectedImage}
                  alt="Selected Attachment"
                  style={{
                    maxWidth: "90vw",
                    maxHeight: "90vh",
                    borderRadius: "8px",
                  }}
                />
              </Box>
            </Modal>
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default Activity;