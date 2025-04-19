import React, { useEffect, useState } from 'react';
import Menu from '@mui/material/Menu';
import {
    TextField,
    List,
    ListItem,
    ListItemAvatar,
    Avatar,
    ListItemText,
    IconButton,
    Typography,
    ListItemButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';

export default function MemberMenu({
    open,
    onClose,
    cardMembers,
    boardMembers,
    onRemoveCardMember,
    anchorEl,
    setAnchorEl,
    onMemberSelect,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCardMembers, setFilteredCardMembers] = useState(cardMembers || []);
    const [filteredBoardMembers, setFilteredBoardMembers] = useState([]);

    useEffect(() => {
        const term = searchTerm.toLowerCase();
        // Lọc thành viên đã có trong card ra khỏi board
        const boardWithoutCard = (boardMembers || []).filter(
            (bm) => !(cardMembers || []).some((cm) => cm.id === bm.id)
        );

        setFilteredCardMembers(
            (cardMembers || []).filter((member) =>
                member.user_name.toLowerCase().includes(term)
            )
        );

        setFilteredBoardMembers(
            boardWithoutCard.filter((member) =>
                member.user_name.toLowerCase().includes(term)
            )
        );
    }, [searchTerm, boardMembers, cardMembers]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddMember = (member) => () => {
        if (onMemberSelect) {
            onMemberSelect(member);
        }
    };

    const handleRemoveCardMember = (memberId) => () => {
        if (onRemoveCardMember) {
            const remaining = (cardMembers || []).filter((m) => m.id !== memberId);
            // Nếu sau khi xoá sẽ không còn ai trong card
            if (remaining.length === 0) {
                handleClose(); // Đóng popover
            }
            onRemoveCardMember(memberId);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
        if (onClose) {
            onClose();
        }
    };

    return (
        <Menu
            id="member-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                'aria-labelledby': 'member-button',
            }}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            sx={{
                mt: "20px"
            }}
        >
            <TextField
                label="Tìm kiếm các thành viên"
                variant="outlined"
                size="small"
                margin="dense"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                    mx: 2,
                    mb: 1,
                    width: 280,
                }}
                InputLabelProps={{
                    sx: { color: 'black' }
                }}
            />

            {filteredCardMembers.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: 'text.secondary', px: 2 }}>
                        Thành viên của thẻ
                    </Typography>
                    <List dense>
                        {filteredCardMembers.map((member) => (
                            <ListItem
                                key={member.id}
                                sx={{ cursor: 'pointer' }}
                                secondaryAction={
                                    <IconButton edge="end" aria-label="remove" onClick={handleRemoveCardMember(member.id)}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                }
                            >
                                <ListItemAvatar>
                                    <InitialsAvatar
                                        sx={{
                                            fontSize: "14px",
                                            width: "32px",
                                            height: "32px",
                                        }}
                                        key={member.id}
                                        size={"32px"}
                                        initials={member.initials}
                                        name={member.full_name}
                                        avatarSrc={member.image}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={member.full_name} />
                            </ListItem>
                        ))}
                    </List>
                </>
            )}

            {filteredBoardMembers.length > 0 && (
                <>
                    <Typography variant="subtitle2" sx={{ mt: 1, mb: 0.5, color: 'text.secondary', px: 2 }}>
                        Thành viên của bảng
                    </Typography>
                    <List dense>
                        {filteredBoardMembers.map((member) => (
                            <ListItemButton
                                key={member.id}
                                onClick={handleAddMember(member)}
                                sx={{ cursor: 'pointer' }}
                            >
                                <ListItemAvatar>
                                    <InitialsAvatar
                                        sx={{
                                            fontSize: "14px",
                                            width: "32px",
                                            height: "32px",
                                        }}
                                        key={member.id}
                                        size={"32px"}
                                        initials={member.initials}
                                        name={member.full_name}
                                        avatarSrc={member.image}
                                    />
                                </ListItemAvatar>
                                <ListItemText primary={member.full_name} />
                            </ListItemButton>
                        ))}
                    </List>
                    
                </>
            )}

            {searchTerm &&
                filteredCardMembers.length === 0 &&
                filteredBoardMembers.length === 0 && (
                    <Typography sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic', px: 2 }}>
                        Không tìm thấy thành viên nào.
                    </Typography>
                )}
        </Menu>
    );
}
