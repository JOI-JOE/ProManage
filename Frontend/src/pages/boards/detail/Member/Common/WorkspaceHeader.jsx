import { Box, Button, Typography, IconButton } from "@mui/material";
import LockIcon from "@mui/icons-material/Lock";
import EditIcon from "@mui/icons-material/Edit";
import WorkspaceAvatar from "../../../../../components/Common/WorkspaceAvatar";
import WorkspaceInfo from "../../../../../components/WorkspaceInfo";
// import WorkspaceAvatar from "../../../../components/Common/WorkspaceAvatar";
// import WorkspaceInfo from "../../../../components/WorkspaceInfo";

const WorkspaceHeader = ({
    workspace,
    isAdmin,
    isFormVisible,
    toggleFormVisibility,
    handleOpenInvite,
    refetchWorkspace,
    allowInvite,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderBottom: "1px solid #D3D3D3",
                paddingBottom: "40px",
                width: "100%",
                maxWidth: "1100px",
                margin: "0 auto",
                minHeight: "80px",
            }}
        >
            {!isFormVisible ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, p: 2 }}>
                    <WorkspaceAvatar workspace={workspace} size={70} />
                    <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <Typography variant="h6" fontWeight="bold" sx={{ fontSize: 24 }}>
                                {workspace?.display_name}
                            </Typography>
                            {isAdmin && (
                                <IconButton
                                    onClick={toggleFormVisibility}
                                    sx={{ color: "gray", "&:hover": { backgroundColor: "transparent" } }}
                                >
                                    <EditIcon sx={{ fontSize: 20 }} />
                                </IconButton>
                            )}
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "5px", color: "gray" }}>
                            <LockIcon sx={{ fontSize: 14 }} />
                            <Typography sx={{ fontSize: 14 }}>Riêng tư</Typography>
                        </Box>
                        <Box sx={{ width: "50%", mt: 2, overflow: "hidden" }}>
                            <Typography
                                fontWeight="bold"
                                sx={{
                                    fontSize: "2rem NEEDLE",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 3,
                                    WebkitBoxOrient: "vertical",
                                    whiteSpace: "normal",
                                }}
                            >
                                {workspace?.desc}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <WorkspaceInfo
                    workspaceInfo={workspace}
                    onCancel={toggleFormVisibility}
                    refetchWorkspace={refetchWorkspace}
                />
            )}

            {isAdmin && allowInvite && (
                <Button
                    variant="contained"
                    sx={{
                        bgcolor: "#026AA7",
                        textTransform: "none",
                        fontSize: "14px",
                        fontWeight: "bold",
                        padding: "8px 12px",
                        boxShadow: "none",
                        marginRight: "60px",
                        "&:hover": { bgcolor: "#005A96" },
                    }}
                    onClick={handleOpenInvite}
                >
                    Mời các thành viên Không gian làm việc
                </Button>
            )}
        </Box>
    );
};

export default WorkspaceHeader;