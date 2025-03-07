import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const GenerateLink = ({ onGenerateLink, onDeleteLink, secret, workspaceId }) => {
    const [linkCopied, setLinkCopied] = useState(false);
    const [showCopiedMessage, setShowCopiedMessage] = useState(false);
    const [isLinkActive, setIsLinkActive] = useState(false);
    const [generatedLink, setGeneratedLink] = useState('');

    useEffect(() => {
        if (secret) {
            setGeneratedLink(`http://localhost:5173/invite/${workspaceId}/${secret}`);
            setIsLinkActive(true);
        } else {
            setGeneratedLink('');
            setIsLinkActive(false);
        }
    }, [secret, workspaceId]); // Chỉ re-run khi secret hoặc workspaceId thay đổi

    const handleGenerateLink = async () => {
        try {
            const link = await onGenerateLink();
            setGeneratedLink(`http://localhost:5173/invite/${workspaceId}/${link}`);
            setIsLinkActive(true);
        } catch (error) {
            console.error('Lỗi khi tạo link:', error);
        }
    };

    const handleCopyLink = () => {
        if (generatedLink) {
            navigator.clipboard.writeText(generatedLink);
            setLinkCopied(true);
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 3000);
        }
    };


    const handleDeleteLink = async () => {
        try {
            await onDeleteLink();
            setIsLinkActive(false);
            setLinkCopied(false);
            setGeneratedLink('');
        } catch (error) {
            console.error('Lỗi khi tạo link:', error);
        }

    };

    return (
        <Stack direction="column" spacing={1}>
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                    p: 1,
                    bgcolor: linkCopied ? '#E6F4EA' : 'transparent',
                    borderRadius: 1,
                }}
            >
                {showCopiedMessage ? (
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircleIcon color="success" />
                        <Typography variant="body2" color="success.main">
                            Liên kết đã sao chép vào khay nhớ tạm
                        </Typography>
                    </Stack>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        {generatedLink || 'Nhấn nút "Tạo liên kết" để tạo link mời'}
                    </Typography>
                )}
                <Button
                    variant="contained"
                    color="primary"
                    onClick={generatedLink ? handleCopyLink : handleGenerateLink}
                >
                    {generatedLink ? 'Sao chép liên kết' : 'Tạo liên kết'}
                </Button>
            </Stack>
            {isLinkActive && (
                <Typography
                    variant="body2"
                    color="primary"
                    sx={{
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textAlign: 'right',
                    }}
                    onClick={handleDeleteLink}
                >
                    Tắt liên kết
                </Typography>
            )}
        </Stack>
    );
};

export default GenerateLink; 