import React from 'react';
import { Avatar } from '@mui/material';

// Danh sách gradient màu cho chữ cái (A-Z)
const letterGradientMap = {
    A: 'linear-gradient(135deg, #FF6B6B, #FFE66D)', // Đỏ đến vàng
    B: 'linear-gradient(135deg, #4ECDC4, #45B7D1)', // Xanh lam nhạt
    C: 'linear-gradient(135deg, #96CEB4, #FFEEAD)', // Xanh lá đến vàng nhạt
    D: 'linear-gradient(135deg, #D4A5A5, #FFCCBC)', // Hồng nhạt đến cam nhạt
    E: 'linear-gradient(135deg, #7B68EE, #B0E0E6)', // Tím đến xanh lam nhạt
    F: 'linear-gradient(135deg, #FF6347, #FFD700)', // Cam đến vàng
    G: 'linear-gradient(135deg, #32CD32, #90EE90)', // Xanh lá
    H: 'linear-gradient(135deg, #403294, #0747A6)', // Tím đậm đến xanh lam
    I: 'linear-gradient(135deg, #FF69B4, #FFB6C1)', // Hồng đến hồng nhạt
    J: 'linear-gradient(135deg, #4682B4, #87CEEB)', // Xanh lam đậm đến xanh lam nhạt
    K: 'linear-gradient(135deg, #FFDAB9, #FFA07A)', // Cam nhạt đến cam
    L: 'linear-gradient(135deg, #6A5ACD, #836FFF)', // Tím đến tím nhạt
    M: 'linear-gradient(135deg, #20B2AA, #40E0D0)', // Xanh lam nhạt đến xanh ngọc
    N: 'linear-gradient(135deg, #9932CC, #BA55D3)', // Tím đậm đến tím nhạt
    O: 'linear-gradient(135deg, #FF4500, #FF8C00)', // Cam đậm đến cam
    P: 'linear-gradient(135deg, #228B22, #98FB98)', // Xanh lá đậm đến xanh lá nhạt
    Q: 'linear-gradient(135deg, #DC143C, #FF4040)', // Đỏ đậm đến đỏ
    R: 'linear-gradient(135deg, #1E90FF, #00BFFF)', // Xanh lam đến xanh lam sáng
    S: 'linear-gradient(135deg, #FF1493, #FF69B4)', // Hồng đậm đến hồng
    T: 'linear-gradient(135deg, #FFD700, #FFFFE0)', // Vàng đến vàng nhạt
    U: 'linear-gradient(135deg, #8A2BE2, #DDA0DD)', // Tím đến tím nhạt
    V: 'linear-gradient(135deg, #00CED1, #20B2AA)', // Xanh ngọc đến xanh lam
    W: 'linear-gradient(135deg, #FF4500, #FFD700)', // Cam đến vàng
    X: 'linear-gradient(135deg, #9932CC, #FF00FF)', // Tím đến hồng
    Y: 'linear-gradient(135deg, #ADFF2F, #7FFF00)', // Xanh lá nhạt đến xanh lá
    Z: 'linear-gradient(135deg, #4B0082, #8B008B)', // Tím đậm đến hồng tím
};

// Danh sách gradient màu cho số (0-9)
const numberGradientMap = {
    '0': 'linear-gradient(135deg, #A9A9A9, #D3D3D3)', // Xám đến xám nhạt
    '1': 'linear-gradient(135deg, #FF4500, #FFA500)', // Cam đậm đến cam sáng
    '2': 'linear-gradient(135deg, #00FF00, #7CFC00)', // Xanh lá đến xanh lá sáng
    '3': 'linear-gradient(135deg, #1E90FF, #87CEFA)', // Xanh lam đến xanh lam nhạt
    '4': 'linear-gradient(135deg, #FF1493, #FFB6C1)', // Hồng đậm đến hồng nhạt
    '5': 'linear-gradient(135deg, #FFD700, #FFFACD)', // Vàng đến vàng nhạt
    '6': 'linear-gradient(135deg, #6A5ACD, #9370DB)', // Tím đến tím nhạt
    '7': 'linear-gradient(135deg, #FF6347, #FFA07A)', // Cam đến cam nhạt
    '8': 'linear-gradient(135deg, #20B2AA, #48D1CC)', // Xanh lam nhạt đến xanh ngọc
    '9': 'linear-gradient(135deg, #9932CC, #DA70D6)', // Tím đậm đến hồng tím
};

const WorkspaceAvatar = ({ workspace, size = 40 }) => {
    // console.log('dữ liệu của workspace', workspace);

    const firstChar = workspace?.display_name?.charAt(0)?.toUpperCase() || 'A';

    let gradient;
    if (/[0-9]/.test(firstChar)) {
        // Nếu là số, dùng numberGradientMap
        gradient = numberGradientMap[firstChar] || 'linear-gradient(135deg, #403294, #0747A6)';
    } else if (/[A-Z]/.test(firstChar)) {
        // Nếu là chữ cái, dùng letterGradientMap
        gradient = letterGradientMap[firstChar] || 'linear-gradient(135deg, #403294, #0747A6)';
    } else {
        // Nếu là ký tự đặc biệt hoặc không xác định, dùng gradient mặc định
        gradient = 'linear-gradient(135deg, #403294, #0747A6)';
    }

    return (
        <Avatar
            sx={{
                background: gradient, // Sử dụng gradient dựa trên ký tự đầu
                color: '#fff',
                width: size,
                height: size,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)', // Hiệu ứng bóng
                fontWeight: 'bold', // Chữ đậm
                fontSize: `${size / 2}px`, // Kích thước chữ tỷ lệ với size
                textTransform: 'uppercase', // Chữ hoa
            }}
        >
            {firstChar}
        </Avatar>
    );
};

export default WorkspaceAvatar;