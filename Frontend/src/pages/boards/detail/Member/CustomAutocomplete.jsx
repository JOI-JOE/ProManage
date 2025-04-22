import React, { useState, Fragment } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import SvgIcon from '@mui/material/SvgIcon';
import Popper from '@mui/material/Popper';
import { toast } from 'react-toastify';

const CustomAutocomplete = ({
    options = [],
    selectedUsers = [],
    setSelectedUsers,
    setSelectedUserIds,
    isLoadingMember,
    loadingLogo,
    handleOptionSelect,
    handleInputChange,
}) => {
    const [inputValue, setInputValue] = useState('');
    const [open, setOpen] = useState(false);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    const filterOptions = (options, { inputValue }) => {
        const trimmedInput = inputValue.trim().toLowerCase();
        const isEmailInput = /^[^\s@]+@[^\s@]+/.test(trimmedInput);

        const filtered = options.filter(
            (option) =>
                option.full_name?.toLowerCase().includes(trimmedInput) ||
                option.user_name?.toLowerCase().includes(trimmedInput) ||
                option.email?.toLowerCase().includes(trimmedInput)
        );

        if (
            isEmailInput &&
            trimmedInput.length > 0 &&
            !filtered.some((option) => option.email?.toLowerCase() === trimmedInput) &&
            !selectedUsers.some((u) => u.email?.toLowerCase() === trimmedInput)
        ) {
            return [
                ...filtered,
                {
                    id: `new-email-${Date.now()}`,
                    full_name: `Add "${inputValue}"`,
                    email: inputValue,
                    isNewEmail: true,
                },
            ];
        }

        return filtered;
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter' && inputValue.trim()) {
            event.preventDefault();
            const trimmedInput = inputValue.trim();

            if (!isValidEmail(trimmedInput)) {
                toast.error('Vui lòng nhập email hợp lệ!');
                return;
            }

            if (
                selectedUsers.some((u) => u.email?.toLowerCase() === trimmedInput.toLowerCase()) ||
                options.some((o) => o.email?.toLowerCase() === trimmedInput.toLowerCase())
            ) {
                toast.error('Email này đã được thêm hoặc đã tồn tại!');
                setInputValue('');
                return;
            }

            const newUser = {
                id: `new-${Date.now()}`,
                full_name: trimmedInput,
                email: trimmedInput,
                image: null,
                joined: false,
                isNewEmail: true,
            };

            setSelectedUsers((prev) => [...prev, newUser]);
            setSelectedUserIds((prevIds) => new Set([...prevIds, newUser.id]));

            // Make sure we clear the input and close the dropdown
            setInputValue('');
            setOpen(false);

            // Force clear the input by setting a timeout
            setTimeout(() => {
                const inputElement = document.querySelector('#custom-autocomplete input');
                if (inputElement) {
                    inputElement.value = '';
                }
            }, 0);
        }
    };

    // Reset input when selecting an option
    const handleChange = (event, newValue, reason) => {
        handleOptionSelect(event, newValue, reason);

        if (reason === 'selectOption') {
            setInputValue('');
            // Force clear the input
            setTimeout(() => {
                const inputElement = document.querySelector('#custom-autocomplete input');
                if (inputElement) {
                    inputElement.value = '';
                }
            }, 0);
        }
    };

    return (
        <Autocomplete
            multiple
            freeSolo
            id="custom-autocomplete"
            options={options.filter((option) => !selectedUsers.some((user) => user.id === option.id))}
            getOptionLabel={(option) => option.full_name || option.email || ''}
            getOptionDisabled={(option) => option.joined}
            filterOptions={filterOptions}
            disableClearable
            popupIcon={null}
            loading={isLoadingMember}
            loadingText={
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
                    <SvgIcon
                        component={loadingLogo}
                        sx={{ width: 50, height: 50, transform: 'scale(0.5)' }}
                        viewBox="0 0 24 24"
                        inheritViewBox
                    />
                </Box>
            }
            noOptionsText={
                isLoadingMember
                    ? 'Đang tìm kiếm...'
                    : inputValue.length >= 3
                        ? 'Không tìm thấy thành viên nào.'
                        : ''
            }
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedUsers}
            onChange={handleChange}
            onInputChange={(event, newValue, reason) => {
                if (reason === 'input') {
                    setInputValue(newValue);
                    handleInputChange({ target: { value: newValue } });
                } else if (reason === 'reset') {
                    setInputValue('');
                }
            }}
            inputValue={inputValue}
            fullWidth
            renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                    <Chip
                        key={option.id}
                        label={option.email || option.full_name}
                        {...getTagProps({ index })}
                        onDelete={() => {
                            const newSelectedUsers = selectedUsers.filter((user) => user.id !== option.id);
                            setSelectedUsers(newSelectedUsers);
                            setSelectedUserIds((prevIds) => {
                                const newIds = new Set(prevIds);
                                newIds.delete(option.id);
                                return newIds;
                            });
                        }}
                    />
                ))
            }
            renderOption={(props, option) => (
                <ListItem {...props} alignItems="flex-start" disabled={option.joined}>
                    <ListItemAvatar>
                        <Avatar
                            alt={option.full_name}
                            src={option.image || '/static/images/avatar/default.jpg'}
                        />
                    </ListItemAvatar>
                    <ListItemText
                        primary={option.isNewEmail ? option.full_name : option.full_name}
                        secondary={
                            <Fragment>
                                <Typography
                                    component="span"
                                    variant="body2"
                                    sx={{ color: 'text.primary', display: 'inline' }}
                                >
                                    {option.isNewEmail
                                        ? option.email
                                        : option.joined
                                            ? option.memberType === 'admin'
                                                ? ' (Quản trị viên)'
                                                : ' (Thành viên)'
                                            : option.email || ''}
                                </Typography>
                            </Fragment>
                        }
                    />
                </ListItem>
            )}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    placeholder="Nhập tên hoặc email..."
                    InputProps={{
                        ...params.InputProps,
                        disableUnderline: true,
                    }}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        handleInputChange(e);
                    }}
                    onKeyDown={handleKeyDown}
                    sx={{ width: '100%', padding: '5px 5px' }}
                />
            )}
            PopperComponent={(props) => (
                <Popper {...props} modifiers={[{ name: 'offset', options: { offset: [0, 15] } }]} />
            )}
            sx={{
                flex: 1,
                '& .MuiAutocomplete-tag': { maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' },
                '& .MuiAutocomplete-inputRoot': {
                    maxHeight: '100px',
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    scrollbarWidth: 'thin',
                    '&::-webkit-scrollbar': { width: '5px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: '#aaa', borderRadius: '10px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: '#888' },
                },
            }}
        />
    );
};

export default CustomAutocomplete;