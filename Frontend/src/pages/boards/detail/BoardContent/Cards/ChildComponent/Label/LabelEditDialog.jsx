import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  InputBase,
  Button,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const colorPalette = [
  ['#c0f0d0', '#f7e999', '#ffdab5', '#ffd5d5', '#e0d7ff'],
  ['#44cc88', '#ffd028', '#ffaa66', '#ff6b6b', '#aa99ff'],
  ['#1a804d', '#996600', '#b34700', '#cc0000', '#6633cc'],
  ['#cceeff', '#99e6ff', '#d8ff99', '#ffccee', '#dddddd'],
  ['#5599ff', '#55ccdd', '#99cc33', '#ff77cc', '#8899aa'],
  ['#0066ff', '#008899', '#668800', '#cc3399', '#556677']
];

const LabelEditDialog = ({ open, onClose, label, onSave, onDelete }) => {
  const [labelName, setLabelName] = useState('');
  const [selectedColor, setSelectedColor] = useState('');

  useEffect(() => {
    if (label) {
      setLabelName(label.name || '');
      setSelectedColor(label.color || colorPalette[1][0]);
    }
  }, [label]);

  const handleSave = () => {
    if (label) {
      onSave({
        ...label,
        name: labelName,
        color: selectedColor
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (label && onDelete) {
      onDelete(label.id);
    }
    onClose();
  };

  const handleClearColor = () => {
    setSelectedColor('');
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      aria-labelledby="label-edit-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: '8px',
          margin: 0,
          width: '100%',
          maxHeight: '85vh',
          bgcolor: 'white'
        }
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          borderBottom: '1px solid rgba(0,0,0,0.08)'
        }}
      >
        <IconButton
          edge="start"
          onClick={onClose}
          aria-label="Quay lại"
          sx={{ color: '#42526E' }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography
          id="label-edit-dialog-title"
          variant="h6"
          component="h2"
          sx={{
            flex: 1,
            textAlign: 'center',
            fontSize: '16px',
            fontWeight: 500,
            color: '#172b4d'
          }}
        >
          Chỉnh sửa nhãn
        </Typography>

        <IconButton
          edge="end"
          onClick={onClose}
          aria-label="Đóng"
          sx={{ color: '#42526E' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Color preview bar */}
      <Box
        aria-hidden="true"
        sx={{
          height: '48px',
          backgroundColor: selectedColor || '#EEEEEE',
          width: '100%'
        }}
      />

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography component="label" htmlFor="label-name-input" sx={{ mb: 1, fontSize: '14px', fontWeight: 500, color: '#172b4d' }}>
            Tiêu đề
          </Typography>
          <InputBase
            id="label-name-input"
            fullWidth
            value={labelName}
            onChange={(e) => setLabelName(e.target.value)}
            placeholder="Nhập tên nhãn"
            sx={{
              border: '2px solid #DFE1E6',
              borderRadius: 1,
              padding: '8px 12px',
              fontSize: '14px',
              mb: 2,
              '&:focus-within': {
                borderColor: '#4C9AFF',
                boxShadow: '0 0 0 1px rgba(76,154,255,0.3)'
              },
              bgcolor: 'white'
            }}
          />

          <Typography component="legend" sx={{ mb: 1, fontSize: '14px', fontWeight: 500, color: '#172b4d' }}>
            Chọn một màu
          </Typography>
        </Box>

        <Box
          component="fieldset"
          sx={{ px: 2, pb: 2, border: 'none', m: 0, p: 0 }}
        >
          {colorPalette.map((row, rowIndex) => (
            <Box
              key={`row-${rowIndex}`}
              sx={{
                display: 'flex',
                mb: 1,
                justifyContent: 'space-between',
                gap: 0.5
              }}
            >
              {row.map((color, colIndex) => (
                <Button
                  key={`color-${rowIndex}-${colIndex}`}
                  aria-label={`Màu ${color}`}
                  sx={{
                    minWidth: '42px',
                    height: '32px',
                    backgroundColor: color,
                    borderRadius: '3px',
                    border: selectedColor === color ? '2px solid #0052CC' : '1px solid rgba(0,0,0,0.1)',
                    flexGrow: 1,
                    p: 0,
                    '&:hover': {
                      opacity: 0.85,
                      backgroundColor: color
                    }
                  }}
                  onClick={() => setSelectedColor(color)}
                />
              ))}
            </Box>
          ))}

          <Button
            fullWidth
            variant="outlined"
            startIcon={<CloseIcon fontSize="small" />}
            sx={{
              textTransform: 'none',
              justifyContent: 'center',
              borderColor: 'rgba(0,0,0,0.1)',
              color: '#172b4d',
              fontSize: '14px',
              p: 1,
              my: 2,
              bgcolor: 'white',
              '&:hover': {
                bgcolor: '#F4F5F7',
                borderColor: 'rgba(0,0,0,0.2)'
              }
            }}
            onClick={handleClearColor}
          >
            Gỡ bỏ màu
          </Button>
        </Box>

        <Box
          component="footer"
          sx={{
            display: 'flex',
            px: 2,
            pb: 2,
            justifyContent: 'space-between'
          }}
        >
          <Button
            variant="contained"
            aria-label="Lưu nhãn"
            sx={{
              bgcolor: '#0052CC',
              color: 'white',
              textTransform: 'none',
              width: '70px',
              height: '32px',
              borderRadius: '3px',
              boxShadow: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              '&:hover': {
                bgcolor: '#0047B3',
                boxShadow: 'none'
              }
            }}
            onClick={handleSave}
          >
            Lưu
          </Button>

          <Button
            variant="contained"
            aria-label="Xóa nhãn"
            sx={{
              bgcolor: '#EA2525',
              color: 'white',
              textTransform: 'none',
              width: '70px',
              height: '32px',
              borderRadius: '3px',
              boxShadow: 'none',
              fontWeight: 'bold',
              fontSize: '14px',
              '&:hover': {
                bgcolor: '#D21F1F',
                boxShadow: 'none'
              }
            }}
            onClick={handleDelete}
          >
            Xoá
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default LabelEditDialog;