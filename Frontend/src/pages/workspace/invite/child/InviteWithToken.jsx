import React from "react";

const InviteWithToken = ({ inviteData }) => {

  console.log(inviteData?.memberInviter?.id)
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