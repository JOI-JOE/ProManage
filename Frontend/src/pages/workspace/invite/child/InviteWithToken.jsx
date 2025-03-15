import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
// import {
//   // useGetInvitationSecret,
//   useAcceptInvitation,
//   useGetValidateMember,
// } from "../../../../hooks/useWorkspaceInvite";
// import { useStateContext } from "../../../../contexts/ContextProvider";


const InviteWithToken = () => {
  // const location = useLocation();
  // const navigate = useNavigate();
  // const { workspaceId, inviteToken } = location.state || {};
  // const { user } = useStateContext(); // Dùng context để lấy user


  // // const { data: invitationData } = useGetInvitationSecret(workspaceId);
  // const { mutate, isLoading, isError, error } = useAcceptInvitation();
  // const { data: memberData } = useGetValidateMember(workspaceId, user?.id);

  // const workspace = invitationData?.workspace;
  // const inviter = invitationData?.memberInviter;


  // useEffect(() => {
  //   if (user?.id && workspaceId && memberData?.success) {
  //     navigate(`/workspaces/${workspaceId}`);
  //   }
  // }, [user?.id, workspaceId, navigate, memberData?.success]);

  // const handleAcceptInvitation = () => {
  //   mutate({ workspaceId, inviteToken });
  // };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Chào mừng chú đến với ProManage </h1>
      {/* {inviter && workspace && ( */}
        <p>
          {/* <strong>{inviter?.fullName}</strong> đã mời bạn vào{" "}
          <strong>{workspace?.displayName}</strong>{" "} */}
        </p>
      {/* )} */}
      {/* <Button
        onClick={handleAcceptInvitation}
        disabled={isLoading}
        variant="contained"
        disableElevation
      >
        Tham gia vào không gian làm việc
      </Button> */}
      {/* {isError && <p style={{ color: "red" }}>Lỗi: {error.message}</p>} */}
    </div>
  );
};

export default InviteWithToken;