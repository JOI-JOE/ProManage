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

const isAuthenticated = () => !!localStorage.getItem("token");

const AcceptTeam = () => {
    const navigate = useNavigate();
    const [invitation, setInvitation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [idMember, setIdMember] = useState(null);

    useEffect(() => {
        const storedInvitation = Cookies.get("invitation");

        if (storedInvitation) {
            const decodedInvitation = decodeURIComponent(storedInvitation);
            const parts = decodedInvitation.split(":");

            if (parts.length === 3 && parts[0] === "workspace") {
                setInvitation({
                    workspaceId: parts[1].trim(),
                    inviteToken: parts[2].trim(),
                });
            }
        }
        setLoading(false);
    }, []);

    const { data: inviteData, isLoading, isError } = useGetInvitationSecretByReferrer(
        invitation?.workspaceId,
        invitation?.inviteToken,
        { enabled: !!invitation?.workspaceId && !!invitation?.inviteToken }
    );

    useEffect(() => {
        const memberId = Cookies.get("idMember");
        setIdMember(memberId);

        // Nếu idMember trùng với người mời thì điều hướng luôn
        if (memberId && memberId === inviteData?.memberInviter?.id) {
            navigate(`/w/${inviteData?.workspace?.display_name}`);
        }
    }, [inviteData, navigate]);

    // Nếu idMember trùng khớp, không cần hiển thị giao diện bên dưới nữa
    if (idMember && idMember === inviteData?.memberInviter?.id) {
        return null; // Không hiển thị gì nữa vì đã điều hướng
    }

    // Nếu đang load từ cookies hoặc API, hiển thị loading
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
    return isAuthenticated() ? <InviteWithToken inviteData={inviteData} /> : <InviteWithoutToken inviteData={inviteData} />;
};

export default AcceptTeam;
