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
import WorkspaceAvatar from '../../../../../components/Common/WorkspaceAvatar';
import InitialsAvatar from '../../../../../components/Common/InitialsAvatar';

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


            {requests?.map((request) => (
                <Box key={request.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <InitialsAvatar
                            name={request?.user?.full_name}
                            avatarSrc={request?.user.image}
                            initials={request?.user?.initials}
                            size={32}
                        />
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                {request.user.full_name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {request.user.email} • {request.user.type}
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                            Đã gửi yêu cầu {request.requestDate}
                        </Typography>
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