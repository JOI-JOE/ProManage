import React from "react";
import {
    ListItem,
    IconButton,
    Box,
    Typography,
    Snackbar,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

const FileItem = ({ file, handleOpen }) => {
    // Kiểm tra loại file
    const fileExt = file.path_url.match(/\.([a-zA-Z0-9]+)$/)?.[1]?.toLowerCase() || "default";
    const imageTypes = ["jpg", "jpeg", "png", "webp", "gif"];
    const isImage = imageTypes.includes(fileExt);

    // Định nghĩa các biểu tượng cho từng loại file
    const fileIcons = {
        pdf: "PDF",
        doc: "DOC",
        docx: "DOCX",
        xls: "XLS",
        xlsx: "XLSX",
        ppt: "PPT",
        pptx: "PPTX",
        rar: "RAR",
        zip: "ZIP",
        txt: "TXT",
        json: "JSON",
        default: "FILE",
    };

    // Định dạng ngày tháng
    const formatDate = (dateStr) => {
        if (!dateStr) return "Không xác định";
        return new Date(dateStr).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    // Xử lý khi nhấp vào file
    const handleClick = () => {
        if (isImage) {
            // Nếu là ảnh và thuộc định dạng hỗ trợ, mở dialog preview
            handleOpen(file.path_url);
        } else {
            // Nếu không phải ảnh hoặc không thuộc định dạng ảnh hỗ trợ, không làm gì
            console.log("File không phải ảnh hoặc không thuộc định dạng hỗ trợ:", file.path_url);
            // Có thể thêm thông báo nếu cần
            // setSnackbarMessage("Chỉ hỗ trợ xem trước các file ảnh (jpg, jpeg, png, webp, gif).");
            // setSnackbarOpen(true);
        }
    };

    return (
        <>
            <ListItem
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    cursor: isImage ? "pointer" : "default", // Chỉ hiển thị con trỏ pointer nếu là ảnh
                    gap: "12px",
                }}
            >
                {/* Thumbnail / Icon */}
                <Box
                    sx={{
                        width: 64,
                        height: 45,
                        flexShrink: 0,
                        borderRadius: "8px",
                        overflow: "hidden",
                        backgroundColor: isImage ? "transparent" : "#E1E3E6",
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: "12px",
                    }}
                >
                    {isImage ? (
                        <Box
                            component="img"
                            src={file.path_url}
                            alt={file.file_name_defaut}
                            sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                            }}
                            onError={(e) => {
                                e.target.style.display = "none"; // Ẩn ảnh nếu lỗi
                                e.target.parentElement.innerText = fileIcons[fileExt] || fileIcons.default; // Hiển thị biểu tượng thay thế
                                e.target.parentElement.style.backgroundColor = "#E1E3E6";
                            }}
                        />
                    ) : (
                        fileIcons[fileExt] || fileIcons.default
                    )}
                </Box>

                {/* Nội dung file */}
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                        sx={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            cursor: isImage ? "pointer" : "default", // Chỉ hiển thị con trỏ pointer nếu là ảnh
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                        }}
                        onClick={handleClick}
                    >
                        {file.file_name_defaut || "Không có tên"}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontSize: "12px", mt: "4px" }}
                    >
                        Đã thêm {formatDate(file.created_at)}
                        {file.is_cover && (
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px",
                                }}
                            >

                                <img
                                    src="https://img.icons8.com/material-outlined/24/image.png"
                                    alt="cover-icon"
                                    style={{
                                        width: "16px",
                                        height: "16px",
                                    }}
                                />
                                <span>• Ảnh bìa</span>
                            </Box>
                        )}
                    </Typography>
                </Box>

                {/* Icon menu 3 chấm */}
                <IconButton
                    onClick={(e) => {
                        e.stopPropagation();
                        // handleMenuOpen1?.(e, file);
                    }}
                    sx={{ ml: "auto" }}
                >
                    <MoreHorizIcon />
                </IconButton>
            </ListItem>
        </>
    );
};

export default FileItem;