import React, { useState } from "react";
import { Autocomplete, TextField, Paper, Button, Box, Popper } from "@mui/material";
// import { useSearchMembers } from "../hooks/useSearchMembers"; // 🔥 Hook gọi API
import { useSearchMembers } from "../../../../../hooks/useWorkspaceInvite";

const MemberSearch = ({ workspaceId, onMemberSelect }) => {
    const [inputValue, setInputValue] = useState("");
    const [selectedUsers, setSelectedUsers] = useState([]); // Theo dõi user đã chọn
    const [hasTyped, setHasTyped] = useState(false); // Kiểm tra xem đã nhập chữ chưa

    // 🔍 Gọi API tìm kiếm member
    const { data, isLoading } = useSearchMembers(inputValue, workspaceId);
    const members = data?.users || [];

    // 📝 Xử lý khi nhập input
    const handleInputChange = (event, value) => {
        setInputValue(value);
        setHasTyped(value.length > 0); // Nếu có chữ -> true
    };

    // 🛠 Xử lý khi chọn option
    const handleOptionSelect = (event, newValue) => {
        setSelectedUsers(newValue); // Cập nhật danh sách đã chọn
        onMemberSelect(newValue); // Gửi dữ liệu lên parent nếu cần
        setInputValue(""); // Reset input sau khi chọn xong
    };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
            {/* Phần Input + Button */}
            <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
                <Paper
                    elevation={0}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flex: 1,
                        borderRadius: "3px",
                        boxShadow: "inset 0 0 0 1px rgba(9, 30, 66, 0.15)",
                        transition: "background-color 85ms ease, border-color 85ms ease, box-shadow 85ms ease",
                        backgroundColor: "#ffffff",
                        padding: "5px 10px",
                    }}
                >
                    <Autocomplete
                        multiple
                        id="custom-autocomplete"
                        options={
                            isLoading || inputValue.length < 3
                                ? []
                                : members.filter((option) => !selectedUsers.some((user) => user.id === option.id))
                        }
                        getOptionLabel={(option) => option.full_name}
                        filterSelectedOptions
                        disableClearable
                        popupIcon={null}
                        loading={isLoading}
                        noOptionsText={
                            inputValue.length >= 3
                                ? "Có vẻ như người đó không phải là thành viên. Nhập email để mời họ"
                                : ""
                        }
                        open={isLoading || (inputValue.length >= 3 && members.length > 0)}
                        value={selectedUsers}
                        onChange={handleOptionSelect}
                        fullWidth
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="standard"
                                placeholder="Nhập tên hoặc email..."
                                InputProps={{
                                    ...params.InputProps,
                                    disableUnderline: true,
                                }}
                                onChange={(e) => handleInputChange(e, e.target.value)}
                                sx={{
                                    width: "100%",
                                    padding: "5px 5px",
                                }}
                            />
                        )}
                        PopperComponent={(props) => (
                            <Popper {...props} modifiers={[{ name: "offset", options: { offset: [0, 15] } }]} />
                        )}
                        sx={{
                            flex: 1,
                            "& .MuiAutocomplete-tag": {
                                maxWidth: "150px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                            },
                            "& .MuiAutocomplete-inputRoot": {
                                maxHeight: "100px",
                                overflowY: "auto",
                                overflowX: "hidden",
                                scrollbarWidth: "thin",
                                "&::-webkit-scrollbar": {
                                    width: "5px",
                                },
                                "&::-webkit-scrollbar-thumb": {
                                    backgroundColor: "#aaa",
                                    borderRadius: "10px",
                                },
                                "&::-webkit-scrollbar-thumb:hover": {
                                    backgroundColor: "#888",
                                },
                            },
                        }}
                    />
                </Paper>
                {selectedUsers.length > 0 && (
                    <Button variant="contained" sx={{ height: "40px", textTransform: "none" }}>
                        Gửi lời mời
                    </Button>
                )}
            </Box>

            {/* TextField chỉ hiển thị nếu có selectedUsers */}
            {selectedUsers.length > 0 && (
                <TextField
                    id="outlined-textarea"
                    placeholder="Tham gia Không gian làm việc này để cộng tác với tôi!"
                    multiline
                    maxRows={2}
                    fullWidth
                    sx={{
                        "& .MuiInputBase-input": { color: "gray" },
                        "& .MuiInputLabel-root": { color: "#9FADBC" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#579DFF" },
                    }}
                />
            )}
        </Box>
    );
};

export default MemberSearch;
