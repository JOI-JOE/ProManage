import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import InviteWithToken from "./child/InviteWithToken";
import InviteWithoutToken from "./child/InviteWithoutToken";
import MissingInvitation from "./handle/MissingInvitation";
import InvalidInvitation from "./handle/InvalidInvitation";
import loadingLogo from "~/assets/loading.svg?react";
import { Box, SvgIcon } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useGetInvitationSecretByReferrer } from "../../../hooks/useWorkspaceInvite";
import { useFetchUserBoardsWithWorkspaces } from "../../../hooks/useUser";
import { useMe } from "../../../contexts/MeContext";

const isAuthenticated = () => !!localStorage.getItem("token");

const AcceptTeam = () => {
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const { workspaceIds } = useMe();

    // Hàm xử lý invitation từ cookie
    const processInvitationFromCookie = (cookieValue) => {
        if (cookieValue) {
            const decodedInvitation = decodeURIComponent(cookieValue);
            const parts = decodedInvitation.split(":");

            if (parts.length === 3 && parts[0] === "workspace") {
                const workspaceId = parts[1].trim();
                const inviteToken = parts[2].trim();
                setInvitation({ workspaceId, inviteToken });

                // Kiểm tra xem user đã tham gia workspace chưa
                const hasJoined = workspaceIds?.some((ws) => ws.id === workspaceId);
                if (hasJoined) {
                    Cookies.remove("invitation"); // Xóa cookie invitation
                    Cookies.remove("pending-invitation"); // Xóa cookie pending-invitation
                    navigate(`/w/${workspaceId}`);
                }
            }
        }
    };

    // Kiểm tra invitation từ cookie hoặc pending-invitation
    useEffect(() => {
        const storedInvitation = Cookies.get("invitation");
        const pendingInvitation = Cookies.get("pending-invitation");

        if (storedInvitation) {
            processInvitationFromCookie(storedInvitation);
        } else if (pendingInvitation && pendingInvitation.startsWith("pending-")) {
            // Xử lý pending-invitation nếu người dùng vừa đăng nhập
            const cleanedPending = pendingInvitation.replace("pending-", "");
            processInvitationFromCookie(cleanedPending);
        }

        setLoading(false);
    }, [workspaceIds, navigate]);

    // Xử lý khi người dùng chưa đăng nhập
    useEffect(() => {
        if (!loading && !isAuthenticated()) {
            if (invitation?.inviteToken && invitation?.workspaceId) {
                // Tạo dữ liệu invitation dạng "workspace:{id}:{token}"
                const invitationValue = `workspace:${invitation.workspaceId}:${invitation.inviteToken}`;
                const encoded = encodeURIComponent(invitationValue);

                Cookies.set("pending-invitation", `pending-${encoded}`, {
                    expires: 1 / 24, // 1 tiếng
                    path: "/",
                });
                // Điều hướng đến login
                navigate("/login");
            } else {
                // Nếu không có invitation hợp lệ, hiển thị MissingInvitation
                setLoading(false);
            }
        }
    }, [loading, invitation, navigate]);

    const { data: inviteData, isLoading, isError } = useGetInvitationSecretByReferrer(
        invitation?.workspaceId,
        invitation?.inviteToken,
        { enabled: !!invitation?.workspaceId && !!invitation?.inviteToken }
    );

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

    // Nếu không có dữ liệu hợp lệ từ cookies, hiển thị MissingInvitation
    if (!invitation?.workspaceId || !invitation?.inviteToken) {
        return <MissingInvitation />;
    }

    // Nếu API trả về lỗi hoặc không có dữ liệu, hiển thị InvalidInvitation
    if (isError || !inviteData) {
        return <InvalidInvitation />;
    }

    // Nếu có dữ liệu hợp lệ, hiển thị giao diện phù hợp
    return <InviteWithToken inviteData={inviteData} invitation={invitation} />;
};

export default AcceptTeam;


