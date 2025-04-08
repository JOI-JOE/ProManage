import React from 'react';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

const CustomButton = ({ type, onClick, sx, size = 24, ...props }) => {
    // Cấu hình các icon dựa trên `type`
    const getIcon = () => {
        const iconProps = { sx: { fontSize: size, color: getColor() } };

        switch (type) {
            case 'close':
                return <CloseIcon {...iconProps} />;
            case 'save':
                return <SaveIcon {...iconProps} />;
            case 'delete':
                return <DeleteIcon {...iconProps} />;
            default:
                return null;
        }
    };

    // Hàm xử lý màu mặc định theo type
    const getColor = () => {
        switch (type) {
            case 'close':
                return 'grey.600';
            case 'save':
                return 'green';
            case 'delete':
                return 'red';
            default:
                return 'inherit';
        }
    };

    return (
        <IconButton
            onClick={onClick}
            sx={{
                borderRadius: '4px',
                padding: '6px 8px',
                '&:hover': {
                    backgroundColor: '#e0e0e0',
                },
                ...sx,
            }}
            {...props}
        >
            {getIcon({ style: { fontWeight: 'bold', fontSize: '2rem' } })}
        </IconButton>
    );
};

export default CustomButton;
