import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import InviteWithToken from "./child/InviteWithToken";
import InviteWithoutToken from "./child/InviteWithoutToken";
import MissingInvitation from "./handle/MissingInvitation";
import InvalidInvitation from "./handle/InvalidInvitation";
import { useNavigate } from "react-router-dom";
import { useMe } from "../../../contexts/MeContext";
import { useGetInvitationSecretByReferrer } from "../../../hooks/useWorkspaceInvite";
import LogoLoading from "../../../components/LogoLoading";

const isAuthenticated = () => !!localStorage.getItem("token");

const AcceptTeam = () => {
    const navigate = useNavigate();
    const { user, workspaceId, isLoading: userLoading } = useMe();
    const idMember = Cookies.get("idMember");
    const user_name = "vito109";

    // Lấy và phân tích thông tin lời mời từ cookies
    const invitation = useMemo(() => {
        const storedInvitation = Cookies.get("invitation");
        if (!storedInvitation) return null;

        try {
            const [type, workspaceId, inviteToken] = decodeURIComponent(storedInvitation).split(":");
            return type === "workspace" && workspaceId?.trim() && inviteToken?.trim()
                ? { workspaceId: workspaceId.trim(), inviteToken: inviteToken.trim() }
                : null;
        } catch (error) {
            console.error("Error parsing invitation:", error);
            return null;
        }
    }, []);

    // Trạng thái để theo dõi
    const [transitionState, setTransitionState] = useState("initial"); // "initial", "redirecting", "done"
    const [redirectPath, setRedirectPath] = useState(null);

    // Kiểm tra tham gia trước khi fetch API
    useEffect(() => {
        if (userLoading || !idMember || !invitation || !user || !workspaceId) return;

        if (transitionState !== "initial") return; // Chỉ chạy khi ở trạng thái ban đầu

        // Kiểm tra nếu đã tham gia workspace
        if (workspaceId?.includes(invitation.workspaceId)) {
            setRedirectPath(`/u/${user_name}/boards`);
            setTransitionState("redirecting");
        } else if (user?.workspaces?.some(w => w.id === invitation.workspaceId)) {
            setRedirectPath(`/w/${invitation.workspaceId}`);
            setTransitionState("redirecting");
        }
    }, [user, workspaceId, idMember, invitation, userLoading, user_name, transitionState]);

    // Fetch thông tin lời mời chỉ khi cần thiết
    const {
        data: inviteData,
        isLoading,
        isError,
    } = useGetInvitationSecretByReferrer(
        invitation?.workspaceId,
        invitation?.inviteToken,
        { enabled: !!invitation && transitionState === "initial" } // Chỉ fetch nếu chưa bắt đầu redirect
    );

    // Kiểm tra thêm sau khi có inviteData
    useEffect(() => {
        if (!inviteData || transitionState !== "initial") return;

        const { workspace, memberInviter } = inviteData;

        if (idMember === memberInviter?.id || workspaceId?.includes(workspace?.id)) {
            setRedirectPath(`/u/${user_name}/boards`);
            setTransitionState("redirecting");
        }
    }, [inviteData, idMember, workspaceId, user_name, transitionState]);

    useEffect(() => {
        if (transitionState === "redirecting" && redirectPath) {
            // Trì hoãn nhẹ để hiển thị loading trước khi điều hướng
            const timer = setTimeout(() => {
                navigate(redirectPath);
                setTransitionState("done");
            }, 300);

            return () => clearTimeout(timer);
        }
    }, [transitionState, redirectPath, navigate]);

    // Render dựa trên trạng thái
    if (userLoading || isLoading || transitionState === "redirecting") {
        return <LogoLoading />; // Hiển thị loading khi đang chờ hoặc chuyển tiếp
    }

    if (transitionState === "done") {
        return null; // Đã điều hướng xong, không render gì
    }

    if (!invitation) return <MissingInvitation />;
    if (isError || !inviteData) return <InvalidInvitation />;

    // Render giao diện khi không cần điều hướng
    return isAuthenticated() ? (
        <InviteWithToken inviteData={inviteData} />
    ) : (
        <InviteWithoutToken inviteData={inviteData} />
    );
};

export default AcceptTeam;