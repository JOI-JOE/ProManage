import React from 'react';
import { Modal, Box } from '@mui/material';
import CustomButton from '../../../../../../components/Common/CustomButton';

const ImagePreview = ({ open, onClose, imageSrc }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="image-preview"
            sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
        >
            <Box sx={{
                position: "relative",
                maxWidth: "90%",
                maxHeight: "90%",
                outline: "none",
                bgcolor: "background.paper",
                borderRadius: 1,
                p: 1,
                boxShadow: 24
            }}>
                <CustomButton
                    type="close"
                    onClick={onClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                    }}
                />

                {imageSrc && (
                    <img
                        src={imageSrc}
                        alt="Xem trước"
                        style={{
                            maxWidth: "100%",
                            maxHeight: "80vh",
                            display: "block"
                        }}
                    />
                )}
            </Box>
        </Modal>
    );
};

export default ImagePreview;