import React from "react";
import { useLocation } from "react-router-dom";
import {
  Button
} from "@mui/material";
import { useGetValidateInvitation, useAcceptInvitation } from "../../../../hooks/useWorkspaceInvite";
import { useStateContext } from "../../../../contexts/ContextProvider";

const InviteWithToken = () => {
  const location = useLocation();
  const { workspaceId, inviteToken } = location.state || {};
  const { user } = useStateContext();

  console.log(user?.id)

  const { data } = useGetValidateInvitation(workspaceId, inviteToken);
  const { mutate, isLoading, isError, error } = useAcceptInvitation();

  const workspace = data?.workspace;
  const inventer = data?.memberInviter;

  const handleAcceptInvitation = () => {
    mutate({ workspaceId, inviteToken });
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Chào mừng chú đến với ProManage </h1>
      <p><strong>{inventer?.fullName}</strong> đã mời bạn vào <strong>{workspace?.displayName}</strong> </p>
      {/* <p>Invite Token: {inviteToken}</p> */}
      <Button onClick={handleAcceptInvitation} disabled={isLoading} variant="contained" disableElevation>
        Tham gia vào không gian làm việc
      </Button>
      {isError && <p style={{ color: 'red' }}>Lỗi: {error.message}</p>}
    </div>
  );
};

export default InviteWithToken;