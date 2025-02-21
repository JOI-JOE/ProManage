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

const CreateWorkspace = () => {
    const [openWorkspaceModal, setOpenWorkspaceModal] = React.useState(false);
    const [openInviteModal, setOpenInviteModal] = React.useState(false);
    const [workspaceName, setWorkspaceName] = React.useState("");
    const [workspaceType, setWorkspaceType] = React.useState("");
    const [workspaceDescription, setWorkspaceDescription] = React.useState("");

    const handleCloseWorkspaceModal = () => {
        setOpenWorkspaceModal(false);
        setWorkspaceName("");
        setWorkspaceType("");
        setWorkspaceDescription("");
    };

    const handleOpenWorkspaceModal = () => {
        setOpenWorkspaceModal(true);
    };

    const { mutate: handleCreateWorkspace, isLoading } = useCreateWorkspace();

    const handleSubmit = () => {
        console.log("Dữ liệu workspace trước khi gửi:", {
            name: workspaceName,
            type: workspaceType,
            desc: workspaceDescription,
        });

        handleCreateWorkspace(
            {
                display_name: workspaceName,
                team_type: workspaceType,
                desc: workspaceDescription,
            },
            {
                onSuccess: (data) => {
                    console.log("Tạo thành công:", data);
                    setOpenWorkspaceModal(false);
                    setWorkspaceName("");
                    setWorkspaceType("");
                    setWorkspaceDescription("");
                    setOpenInviteModal(true);
                },
                onError: (error) => {
                    console.error("Lỗi:", error.response?.data || error.message);
                    alert("Có lỗi xảy ra khi tạo không gian làm việc!");
                },
            }
        );
    };

    return (
        <div>
            {/* Modal Tạo Không gian làm việc */}
            <MenuItem onClick={handleOpenWorkspaceModal}>
                <PeopleIcon sx={{ mr: 2 }} /> Tạo Không gian làm việc
            </MenuItem>

            <Modal open={openWorkspaceModal} onClose={handleCloseWorkspaceModal}>
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
                    }}
                >
                    <IconButton
                        onClick={handleCloseWorkspaceModal}
                        sx={{ position: "absolute", top: 8, right: 8, color: "black" }}
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
                        fullWidth
                        placeholder="Công ty của bạn"
                        variant="outlined"
                        sx={{ mb: 1, color: "black" }}
                        value={workspaceName}
                        onChange={(e) => {
                            console.log("workspaceName:", e.target.value); // Debug
                            setWorkspaceName(e.target.value);
                        }}
                    />
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
                            console.log("workspaceType:", e.target.value); // Debug
                            setWorkspaceType(e.target.value);
                        }}
                        displayEmpty
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
                    />
                    <Typography variant="body2" sx={{ mb: 4, color: "black" }}>
                        Đưa các thành viên của bạn vào bảng với mô tả ngắn về Không gian làm
                        việc của bạn.
                    </Typography>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleSubmit}
                    // disabled={!workspaceName || !workspaceType || !workspaceDescription} // Kiểm tra điều kiện
                    >
                        Tiếp tục
                    </Button>
                </Box>
            </Modal>

            {/* Modal Mời Thành Viên */}
            <Modal open={openInviteModal} onClose={() => setOpenInviteModal(false)}>
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
                    }}
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
            </Modal>
        </div>
    );
};

export default CreateWorkspace;