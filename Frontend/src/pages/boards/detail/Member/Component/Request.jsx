import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Checkbox,
    Avatar,
    Button,
    FormControlLabel
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';

const Request = ({ requests }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedRequests, setSelectedRequests] = useState([]);

    // Example join request data
    const joinRequests = [
        {
            id: 'req1',
            user: {
                full_name: 'Promanage',
                email: 'promanage8',
                initials: 'P',
                type: 'Khách của Không gian làm việc'
            },
            requestDate: 'April 22nd, 2025'
        }
    ];

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleSelectAll = (event) => {
        const checked = event.target.checked;
        setSelectAll(checked);
        if (checked) {
            setSelectedRequests(joinRequests.map(req => req.id));
        } else {
            setSelectedRequests([]);
        }
    };

    const handleSelectRequest = (requestId) => {
        if (selectedRequests.includes(requestId)) {
            setSelectedRequests(selectedRequests.filter(id => id !== requestId));
            setSelectAll(false);
        } else {
            setSelectedRequests([...selectedRequests, requestId]);
            if (selectedRequests.length + 1 === joinRequests.length) {
                setSelectAll(true);
            }
        }
    };

    return (
        <Box>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 'bold', mb: 2 }}>
                Yêu cầu tham gia ({requests?.length})
            </Typography>

            <Typography variant="body2" sx={{ mb: 3 }}>
                Những người này đã yêu cầu tham gia Không gian làm việc này. Thêm thành viên Không gian làm việc mới sẽ tự động cập nhật hóa đơn của bạn.
            </Typography>

            <TextField
                fullWidth
                placeholder="Lọc theo tên"
                size="small"
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '4px',
                    }
                }}
            />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={selectAll}
                            onChange={handleSelectAll}
                            size="small"
                        />
                    }
                    label={
                        <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>
                            Chọn tất cả ({joinRequests.length})
                        </Typography>
                    }
                />

                <Box sx={{ flexGrow: 1 }} />

                <Button
                    variant="contained"
                    disabled={selectedRequests.length === 0}
                    sx={{
                        bgcolor: '#EBEEF0',
                        color: '#172B4D',
                        textTransform: 'none',
                        mr: 2,
                        '&:hover': { bgcolor: '#D8DEE4' },
                        '&.Mui-disabled': {
                            bgcolor: '#F4F5F7',
                            color: '#A5ADBA'
                        }
                    }}
                >
                    Thêm mục đã chọn vào Không gian làm việc
                </Button>

                <Button
                    variant="contained"
                    disabled={selectedRequests.length === 0}
                    sx={{
                        bgcolor: '#EBEEF0',
                        color: '#172B4D',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#D8DEE4' },
                        '&.Mui-disabled': {
                            bgcolor: '#F4F5F7',
                            color: '#A5ADBA'
                        }
                    }}
                >
                    Xóa yêu cầu đã chọn
                </Button>
            </Box>

            {requests?.map((request) => (
                <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Checkbox
                        checked={selectedRequests.includes(request.id)}
                        onChange={() => handleSelectRequest(request.id)}
                        size="small"
                    />

                    <Avatar
                        sx={{
                            bgcolor: '#e74c3c',
                            width: 40,
                            height: 40,
                            fontSize: '1rem',
                            mr: 2
                        }}
                    >
                        {request.user.initials}
                    </Avatar>

                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                            {request.user.full_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            @{request.user.email} • {request.user.type}
                        </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                        Đã gửi yêu cầu {request.requestDate}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                            variant="contained"
                            size="small"
                            sx={{
                                textTransform: 'none',
                                bgcolor: '#0052CC',
                                color: 'white',
                                '&:hover': { bgcolor: '#0747A6' }
                            }}
                        >
                            Thêm vào Không gian làm việc
                        </Button>

                        <Button
                            variant="text"
                            sx={{
                                minWidth: '32px',
                                borderRadius: '4px',
                                color: '#57606f'
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </Button>
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default Request;