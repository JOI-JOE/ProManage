import React from "react";
import { Box, Button, CircularProgress } from "@mui/material";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// Custom styles for the toolbar and editor
const CommentEditor = ({
    value,
    onChange,
    onSave,
    onCancel,
    isSaveDisabled = false,
    isLoading = false,
    saveLabel = "Lưu",
    cancelLabel = "Hủy",
    placeholder = "Edit your comment...",
    autoFocus = false,
    editorHeight = "150px",
    minHeight = "100px",
    maxWidth = "100%",
}) => {
    // Define styles with dynamic values
    const editorStyles = `
    .ql-toolbar.ql-snow {
      border: 1px solid #d1d1d1;
      border-radius: 4px 4px 0 0;
      padding: 4px 8px;
      background: #f5f5f5;
    }
    .ql-container.ql-snow {
      border: 1px solid #d1d1d1;
      border-top: none;
      border-radius: 0 0 4px 4px;
      min-height: ${minHeight};
      height: ${editorHeight};
      font-size: 14px;
      color: #172b4d;
    }
    .ql-editor {
      min-height: ${minHeight};
      padding: 8px;
    }
    .ql-editor img {
      max-width: 100%;
      height: auto;
      margin: 8px 0;
    }
    .ql-snow .ql-picker-label {
      color: #172b4d;
      font-size: 14px;
    }
    .ql-snow .ql-picker-options {
      font-size: 14px;
    }
    .ql-snow .ql-tooltip {
      z-index: 1000;
    }
    .ql-snow .ql-toolbar button {
      color: #172b4d;
    }
    .ql-snow .ql-toolbar button:hover {
      color: #000;
    }
  `;

    return (
        <Box sx={{ maxWidth: maxWidth, width: "100%" }}>
            {/* Inject custom styles */}
            <style>{editorStyles}</style>

            <ReactQuill
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                theme="snow"
                modules={{
                    toolbar: [
                        [{ font: [] }], // Font dropdown
                        ["bold", "italic"], // Bold, Italic
                        [{ list: "bullet" }], // Bullet list
                        [{ header: [1, 2, 3, false] }], // Heading dropdown
                        ["link", "image"], // Link and Image
                        ["clean"], // Clear formatting
                    ],
                }}
                formats={["font", "bold", "italic", "list", "bullet", "header", "link", "image"]}
                autoFocus={autoFocus}
            />

            {/* Add Save, Cancel buttons, and Formatting Help link */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                    mt: 1,
                }}
            >
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                        variant="contained"
                        size="small"
                        sx={{
                            backgroundColor: "#0052cc", // Blue color to match the screenshot
                            color: "#FFF",
                            fontSize: "0.75rem",
                            height: "28px",
                            minWidth: "60px",
                            "&:hover": {
                                backgroundColor: "#003087", // Darker blue on hover
                            },
                        }}
                        onClick={onSave}
                        disabled={isSaveDisabled || isLoading}
                        startIcon={isLoading ? <CircularProgress size={12} color="inherit" /> : null}
                    >
                        {saveLabel}
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        sx={{
                            color: "#172B4D",
                            borderColor: "#d1d1d1",
                            fontSize: "0.75rem",
                            height: "28px",
                            minWidth: "60px",
                            "&:hover": {
                                backgroundColor: "#E4E7EB",
                                borderColor: "#bbb",
                            },
                        }}
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </Button>
                </Box>
            </Box>
        </Box>
    );
};

export default CommentEditor;