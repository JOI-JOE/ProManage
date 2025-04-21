import React, { useState } from "react";
import {
    Popover,
    Box,
    Typography,
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const MemberSelector = ({
    cardId,
    cardMembers = [],
    boardMembers = [],
    onToggleMember,
}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [search, setSearch] = useState("");

    const open = Boolean(anchorEl);
    const id = open ? "member-selector-popover" : undefined;

    const handleOpenPopover = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClosePopover = () => {
        setAnchorEl(null);
        setSearch("");
    };

    // Lọc boardMembers để loại bỏ các thành viên đã có trong cardMembers
    const filteredBoardMembers = boardMembers.filter(
        boardMember => !cardMembers.some(cardMember => cardMember.id === boardMember.id)
    );

    const renderMember = (member, isSelected) => (
        <ListItem
            key={member.id}
            secondaryAction={
                isSelected && (
                    <IconButton edge="end" onClick={() => onToggleMember(member, cardId)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                )
            }
            button
            onClick={() => !isSelected && onToggleMember(member, cardId)}
            sx={{ cursor: "pointer" }}
        >
            <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32, fontSize: "0.8rem" }}>
                    {member.full_name?.charAt(0)?.toUpperCase()}
                </Avatar>
            </ListItemAvatar>
            <ListItemText primary={member.full_name} />
        </ListItem>
    );

    const filterMembers = (list) => {
        if (!Array.isArray(list)) {
            console.error("Expected list to be an array but got:", list);
            return [];
        }
        return list.filter((m) =>
            m.full_name?.toLowerCase().includes(search.toLowerCase())
        );
    };

    return (
        <>
            <Box
                onClick={handleOpenPopover}
                sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    backgroundColor: "#ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                }}
            >
                +
            </Box>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClosePopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                    sx: { width: 300, p: 2, borderRadius: 2 },
                }}
            >
                <Typography fontWeight="bold" mb={1}>
                    Thành viên
                </Typography>
                <TextField
                    fullWidth
                    placeholder="Tìm kiếm các thành viên"
                    size="small"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                <List dense>
                    {filterMembers(cardMembers).length > 0 && (
                        <>
                            <Typography variant="caption" mt={2} mb={0.5}>
                                Thành viên của thẻ
                            </Typography>
                            {filterMembers(cardMembers).map((member) => renderMember(member, true))}
                            <Divider sx={{ my: 1 }} />
                        </>
                    )}

                    {filterMembers(filteredBoardMembers).length > 0 && (
                        <>
                            <Typography variant="caption" mt={1}>
                                Thành viên của bảng
                            </Typography>
                            {filterMembers(filteredBoardMembers).map((member) => renderMember(member, false))}
                            <Divider sx={{ my: 1 }} />
                        </>
                    )}
                </List>
            </Popover>
        </>
    );
};

export default MemberSelector;