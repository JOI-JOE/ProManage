import * as React from 'react';
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
    const [searchTerm, setSearchTerm] = React.useState('');
    const [filteredCardMembers, setFilteredCardMembers] = React.useState(cardMembers || []);
    const [filteredBoardMembers, setFilteredBoardMembers] = React.useState([]);

    React.useEffect(() => {
        const term = searchTerm.toLowerCase();

        // Lọc thành viên đã có trong card ra khỏi board
        const boardWithoutCard = (boardMembers || []).filter(
            (bm) => !(cardMembers || []).some((cm) => cm.id === bm.id)
        );

        setFilteredCardMembers(
            (cardMembers || []).filter((member) =>
                member.name.toLowerCase().includes(term)
            )
        );

        setFilteredBoardMembers(
            boardWithoutCard.filter((member) =>
                member.name.toLowerCase().includes(term)
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
            onRemoveCardMember(memberId);
        }
        handleClose();
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
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <Typography variant="h6" sx={{ p: 2 }}>
                Thành viên
                <IconButton onClick={handleClose} sx={{ position: 'absolute', top: 5, right: 5 }}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Typography>

            <TextField
                label="Tìm kiếm các thành viên"
                variant="outlined"
                size="small"
                margin="dense"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mx: 2, mb: 1, width: 280 }}
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
                                    <Avatar>{member.initials}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={member.name} />
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
                                    <Avatar>{member.initials}</Avatar>
                                </ListItemAvatar>
                                <ListItemText primary={member.name} />
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
