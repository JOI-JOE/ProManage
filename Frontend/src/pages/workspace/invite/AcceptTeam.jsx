import { useEffect, useState, useMemo } from "react";
import Cookies from "js-cookie";
import InviteWithToken from "./child/InviteWithToken";
import InviteWithoutToken from "./child/InviteWithoutToken";
import MissingInvitation from "./handle/MissingInvitation";
import InvalidInvitation from "./handle/InvalidInvitation";
import loadingLogo from "~/assets/loading.svg?react";
import { Box, SvgIcon } from "@mui/material";
import { useGetInvitationSecretByReferrer } from "../../../hooks/useWorkspaceInvite";

const isAuthenticated = () => !!localStorage.getItem("token");

const AcceptTeam = () => {
    const [invitation, setInvitation] = useState({ workspaceId: null, inviteToken: null });
    const [loading, setLoading] = useState(true); // Loading khi đang đọc cookie

    useEffect(() => {
        const storedInvitation = Cookies.get("invitation");
        if (storedInvitation) {
            const decodedInvitation = decodeURIComponent(storedInvitation);
            const parts = decodedInvitation.split(":");

            if (parts.length === 3 && parts[0] === "workspace") {
                setInvitation({ workspaceId: parts[1], inviteToken: parts[2] });
            }
        }
        setLoading(false); // Xong giai đoạn lấy dữ liệu từ cookie
    }, []);

    const { workspaceId, inviteToken } = invitation;

    // Giữ giá trị stable trước khi gọi hook
    const stableWorkspaceId = useMemo(() => workspaceId, [workspaceId]);
    const stableInviteToken = useMemo(() => inviteToken, [inviteToken]);

    // Gọi API kiểm tra lời mời (luôn được gọi để tránh vi phạm quy tắc hooks)
    const { data, isLoading, isError } = useGetInvitationSecretByReferrer(stableWorkspaceId, stableInviteToken);

    // Loading khi đang lấy dữ liệu từ cookie hoặc API
    if (loading || isLoading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", py: 1 }}>
                <SvgIcon
                    component={loadingLogo}
                    sx={{ width: 50, height: 50, transform: "scale(0.5)" }}
                    viewBox="0 0 24 24"
                    inheritViewBox
                />
            </Box>
        );
    }

    // Nếu không có workspaceId hoặc inviteToken
    if (!workspaceId || !inviteToken) {
        return <MissingInvitation />;
    }

    // Nếu API trả về lỗi hoặc lời mời không hợp lệ
    if (isError) {
        return <InvalidInvitation />;
    }
    return isAuthenticated() ? <InviteWithToken /> : <InviteWithoutToken />;
};

export default AcceptTeam;
