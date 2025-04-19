import React, { useState } from 'react';
import { Box, Typography, Link, CircularProgress } from '@mui/material';
import ImagePreview from '../../Common/ImagePreview';
import InitialsAvatar from '../../../../../../../components/Common/InitialsAvatar';
import { styled } from '@mui/material/styles';
import { useFetchActivities } from '../../../../../../../hooks/useCard';
import LogoLoading from '../../../../../../../components/LogoLoading';

const ActivityItemWrapper = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 0),
    '&:last-child': {
        borderBottom: 'none',
    },
}));

const ActivityContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    marginLeft: theme.spacing(1.5),
}));

const TimestampTypography = styled(Typography)(({ theme }) => ({
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
}));

const FilePreviewImage = styled('img')(({ theme }) => ({
    maxWidth: '100%',
    maxHeight: '100px',
    borderRadius: theme.shape.borderRadius,
    cursor: 'pointer',
    marginTop: theme.spacing(1),
}));

const FileNameTypography = styled(Typography)(({ theme }) => ({
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(0.5),
}));

// ActivityItem Component
const ActivityItem = ({ item, handleImageClick, formatTime }) => {
    if (!item || !item.description) return null;

    const { description, created_at, properties, event, causer, relative_time } = item;

    const getActivityText = () => {
        // Tách phần hành động từ description, loại bỏ tên nếu cần
        const actionText = description.replace(
            `${causer?.full_name || description.split(' ')[0]} `,
            ''
        );

        switch (event) {
            case 'created_attachment_file':
                return (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <Typography
                            component="span"
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#172b4d' }}
                        >
                            {causer?.full_name || description.split(' ')[0]}
                        </Typography>{' '}
                        đã đính kèm tập tin{' '}
                        {properties?.file_name_defaut && (
                            <Link component="span" color="primary" underline="hover">
                                {properties.file_name_defaut}
                            </Link>
                        )}
                    </Typography>
                );
            default:
                return (
                    <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        <Typography
                            component="span"
                            variant="subtitle2"
                            sx={{ fontWeight: 600, fontSize: '0.875rem', color: '#172b4d' }}
                        >
                            {causer?.full_name || description.split(' ')[0]}
                        </Typography>{' '}
                        {actionText}
                    </Typography>
                );
        }
    };

    return (
        <ActivityItemWrapper>
            <InitialsAvatar
                sx={{ width: '32px', fontSize: '0.8rem', height: '32px' }}
                initials={causer?.initials || causer?.full_name?.charAt(0).toUpperCase() || description?.charAt(0).toUpperCase()}
                name={causer?.full_name || description.split(' ')[0]}
                avatarSrc={causer?.image}
            />
            <ActivityContent>
                {getActivityText()}
                <TimestampTypography>
                    {relative_time || formatTime(created_at)}
                </TimestampTypography>
                {properties?.path_url && event === 'created_attachment_file' && (
                    <Box mt={1}>
                        <FilePreviewImage
                            src={properties.path_url}
                            alt={properties.file_name_defaut || 'Tập đính kèm'}
                            onClick={() => handleImageClick(properties.path_url)}
                        />
                        {properties.file_name_defaut && (
                            <FileNameTypography>{properties.file_name_defaut}</FileNameTypography>
                        )}
                    </Box>
                )}
            </ActivityContent>
        </ActivityItemWrapper>
    );
};

// ActivityFeed Component (giữ nguyên)
const ActivityFeed = ({ cardId }) => {
    const { data: response, isLoading, error } = useFetchActivities(cardId);
    const [selectedImage, setSelectedImage] = useState(null);

    const handleImageClick = (imagePath) => {
        setSelectedImage(imagePath);
    };

    const handleCloseModal = () => {
        setSelectedImage(null);
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        }).replace('thg', 'thg');
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" py={4}>
                <LogoLoading scale={0.3} />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography variant="body2" color="error" sx={{ py: 2, textAlign: 'center' }}>
                Đã xảy ra lỗi khi tải hoạt động
            </Typography>
        );
    }

    const activities = response?.activities || [];

    return (
        <Box sx={{ width: '100%' }}>
            <Box>
                {activities.length > 0 ? (
                    activities.map((item) => (
                        <ActivityItem
                            key={item.id}
                            item={item}
                            handleImageClick={handleImageClick}
                            formatTime={formatTime}
                        />
                    ))
                ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                        Không có hoạt động nào gần đây
                    </Typography>
                )}
            </Box>

            <ImagePreview
                open={Boolean(selectedImage)}
                onClose={handleCloseModal}
                imageSrc={selectedImage}
            />
        </Box>
    );
};

export default ActivityFeed;