import * as React from "react";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select from "@mui/material/Select";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import { useCreateWorkspace } from "../hooks/useWorkspace";
import LogoLoading from "./Common/LogoLoading";
import CircularProgress from "@mui/material/CircularProgress";

const CreateWorkspace = () => {
    const [openWorkspaceModal, setOpenWorkspaceModal] = React.useState(false);
    const [openInviteModal, setOpenInviteModal] = React.useState(false);
    const [workspaceName, setWorkspaceName] = React.useState("");
    const [workspaceType, setWorkspaceType] = React.useState("");
    const [workspaceDescription, setWorkspaceDescription] = React.useState("");
    const [errorMessage, setErrorMessage] = React.useState("");
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleCloseWorkspaceModal = () => {
        // Không cho phép đóng modal khi đang gửi request
        if (isSubmitting) return;

        setOpenWorkspaceModal(false);
        setWorkspaceName("");
        setWorkspaceType("");
        setWorkspaceDescription("");
        setErrorMessage("");
    };

    const handleOpenWorkspaceModal = () => {
        setOpenWorkspaceModal(true);
        setErrorMessage("");
    };

    const { mutate: handleCreateWorkspace, isLoading } = useCreateWorkspace();

    const handleSubmit = () => {
        // Đặt trạng thái đang submit để ngăn người dùng bấm nhiều lần
        setIsSubmitting(true);

        console.log("Dữ liệu workspace trước khi gửi:", {
            name: workspaceName,
            type: workspaceType,
            desc: workspaceDescription || null,
        });

        handleCreateWorkspace(
            {
                display_name: workspaceName,
                team_type: workspaceType,
                desc: workspaceDescription || null,
            },
            {
                onSuccess: (data) => {
                    console.log("Tạo thành công:", data);   
                    setIsSubmitting(false);
                    setOpenWorkspaceModal(false);
                    setWorkspaceName("");
                    setWorkspaceType("");
                    setWorkspaceDescription("");
                    setErrorMessage("");
                    setOpenInviteModal(true);
                },
                onError: (error) => {
                    console.error("Lỗi:", error.response?.data || error.message);
                    setIsSubmitting(false);
                    const errorData = error.response?.data;
                    if (errorData?.message === "The display name has already been taken.") {
                        setErrorMessage("Tên không gian làm việc đã được sử dụng. Vui lòng chọn tên khác.");
                    } else {
                        setErrorMessage("Có lỗi xảy ra khi tạo không gian làm việc!");
                    }
                },
            }
        );
    };

    // Handle keyboard events to prevent focus loss
    const handleKeyDown = (event) => {
        if (event.shiftKey && (event.key === "C" || event.key === "V")) {
            event.stopPropagation();
        }
    };

    return (
        <div>
            {/* Modal Tạo Không gian làm việc */}
            <MenuItem onClick={handleOpenWorkspaceModal}>
                <PeopleIcon sx={{ mr: 2 }} /> Tạo Không gian làm việc
            </MenuItem>

            <Modal
                open={openWorkspaceModal}
                onClose={handleCloseWorkspaceModal}
                disableEnforceFocus={false}
                disableAutoFocus={true}
                disableEscapeKeyDown={isSubmitting} // Vô hiệu hóa nút ESC khi đang submit
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 500,
                        bgcolor: "#F4F5F7",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        display: "flex",
                        flexDirection: "column",
                        color: "black",
                        outline: "none",
                    }}
                    onKeyDown={handleKeyDown}
                >
                    <IconButton
                        onClick={handleCloseWorkspaceModal}
                        sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
                        disabled={isSubmitting} // Vô hiệu hóa nút đóng khi đang submit
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", mb: 1, color: "black", fontSize: "27px" }}
                    >
                        Hãy xây dựng một Không gian làm việc
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ mb: 2, color: "D6D7D9", fontSize: "15px" }}
                    >
                        Tăng năng suất của bạn bằng cách giúp mọi người dễ dàng truy cập
                        bảng ở một vị trí.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1, color: "black" }}
                    >
                        Tên Không gian làm việc
                    </Typography>
                    <TextField
                        required
                        fullWidth
                        placeholder="Công ty của bạn"
                        value={workspaceName}
                        onChange={(e) => {
                            console.log("workspaceName:", e.target.value);
                            setWorkspaceName(e.target.value);
                            setErrorMessage("");
                        }}
                        InputLabelProps={{
                            style: { color: "gray" },
                        }}
                        disabled={isSubmitting} // Vô hiệu hóa input khi đang submit
                        sx={{
                            mb: 1,
                            color: "black",
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: "black",
                                    borderWidth: 1,
                                },
                                "&:hover fieldset": {
                                    borderColor: "black",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "black",
                                    borderWidth: 1,
                                },
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                                borderRadius: "4px",
                            },
                        }}
                        autoFocus
                    />
                    {errorMessage && (
                        <Typography variant="body2" sx={{ color: "red", mb: 1 }}>
                            {errorMessage}
                        </Typography>
                    )}
                    <Typography variant="body2" sx={{ mb: 4, color: "black" }}>
                        Đây là tên của công ty, nhóm hoặc tổ chức của bạn.
                    </Typography>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1, color: "black" }}
                    >
                        Loại Không gian làm việc
                    </Typography>
                    <Select
                        fullWidth
                        value={workspaceType}
                        onChange={(e) => {
                            console.log("workspaceType:", e.target.value);
                            setWorkspaceType(e.target.value);
                        }}
                        displayEmpty
                        disabled={isSubmitting} // Vô hiệu hóa select khi đang submit
                        sx={{ mb: 2 }}
                    >
                        <MenuItem value="" disabled>
                            Chọn...
                        </MenuItem>
                        <MenuItem value="crm">Kinh doanh CRM</MenuItem>
                        <MenuItem value="smallbiz">Doanh nghiệp nhỏ</MenuItem>
                        <MenuItem value="hr">Nhân sự</MenuItem>
                        <MenuItem value="it">Kỹ thuật-CNTT</MenuItem>
                        <MenuItem value="education">Giáo dục</MenuItem>
                        <MenuItem value="marketing">Marketing</MenuItem>
                        <MenuItem value="management">Điều hành</MenuItem>
                        <MenuItem value="other">Khác</MenuItem>
                    </Select>
                    <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", mb: 1, color: "black" }}
                    >
                        Mô tả Không gian làm việc (Tùy chọn)
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="Nhóm của chúng tôi tổ chức mọi thứ ở đây"
                        variant="outlined"
                        sx={{ mb: 1 }}
                        value={workspaceDescription}
                        onChange={(e) => setWorkspaceDescription(e.target.value)}
                        disabled={isSubmitting} // Vô hiệu hóa input khi đang submit
                    />
                    <Typography variant="body2" sx={{ mb: 4, color: "black" }}>
                        Đưa các thành viên của bạn vào bảng với mô tả ngắn về Không gian làm
                        việc của bạn.
                    </Typography>
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={!workspaceName || !workspaceType || isSubmitting}
                        startIcon={isSubmitting ? <LogoLoading scale={0.3} color="inherit" /> : null}
                    >
                        {isSubmitting ? "Đang tạo..." : "Tiếp tục"}
                    </Button>
                </Box>
            </Modal>

            {/* Modal Mời Thành Viên */}
            {/* <Modal
                open={openInviteModal}
                onClose={() => setOpenInviteModal(false)}
                disableEnforceFocus={false}
                disableAutoFocus={true}
                disableEscapeKeyDown={false}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: 500,
                        bgcolor: "white",
                        boxShadow: 24,
                        p: 4,
                        borderRadius: 2,
                        outline: "none",
                    }}
                    onKeyDown={handleKeyDown}
                >
                    <IconButton
                        onClick={() => setOpenInviteModal(false)}
                        sx={{ position: "absolute", top: 8, right: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: "bold", mb: 1, fontSize: "27px" }}
                    >
                        Mời nhóm của bạn
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Mời tối đa 9 người khác bằng liên kết hoặc nhập tên hoặc email của
                        họ.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: "bold", mb: 1 }}>
                        Các thành viên Không gian làm việc
                    </Typography>
                    <TextField
                        fullWidth
                        placeholder="ví dụ: calrissian@cloud.ci"
                        variant="outlined"
                        sx={{ mb: 2 }}
                        autoFocus
                    />
                    <Button fullWidth variant="contained" disabled>
                        Mời vào Không gian làm việc
                    </Button>
                    <Typography
                        variant="body2"
                        sx={{
                            textAlign: "center",
                            mt: 2,
                            color: "blue",
                            cursor: "pointer",
                            textDecoration: "underline",
                        }}
                        onClick={() => setOpenInviteModal(false)}
                    >
                        Tôi sẽ thực hiện sau
                    </Typography>
                </Box>
            </Modal> */}
        </div>
    );
};

export default CreateWorkspace;