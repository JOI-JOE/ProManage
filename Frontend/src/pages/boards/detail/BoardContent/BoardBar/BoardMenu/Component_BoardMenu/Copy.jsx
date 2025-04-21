import React, { useEffect, useMemo, useState } from "react";
import {
  Popover,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  Checkbox,
  FormControlLabel,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import WorkIcon from "@mui/icons-material/Work";
import PublicIcon from "@mui/icons-material/Public";
import DomainIcon from "@mui/icons-material/Domain";
import GroupIcon from "@mui/icons-material/Group"; // Icon cho Không gian làm việc
import { useCopyBoard } from "../../../../../../../hooks/useBoard";
import { useNavigate, useParams } from "react-router-dom";
import { useGetWorkspaces } from "../../../../../../../hooks/useWorkspace";
// import { useUser } from "../../../../../../../hooks/useUser";
import { useGetBoardMembers } from "../../../../../../../hooks/useInviteBoard";
import { useWorkspace } from "../../../../../../../contexts/WorkspaceContext";
import { useMe } from "../../../../../../../contexts/MeContext";


const Copy = ({ open, onClose, anchorEl, currentWorkspaceId }) => {
  const { boardId, boardName } = useParams();

  const [title, setTitle] = useState("");
  const { workspaces } = useWorkspace();
  // const { data: workspaces = [], isLoading, error } = useUserWorkspaces();
  // const { data: workspaces, isLoading: isLoadingWorkspaces, error } = useGetWorkspaces();
  const memoizedWorkspaces = useMemo(() => workspaces ?? [], [workspaces]);

  const navigate = useNavigate()
  const [workspace, setWorkspace] = useState(currentWorkspaceId || "");
  const [keepCards, setKeepCards] = useState(true);
  const [showChangePopover, setShowChangePopover] = useState(false);
  const [visibility, setVisibility] = useState("workspace"); // Mặc định là không gian làm việc
  const { mutate: copyBoard, isCopyLoading } = useCopyBoard();
  // const { data: user } = useUser();
  const { user } = useMe();
  const { data: boardMembers = [] } = useGetBoardMembers(boardId);

  const currentUserId = user?.id;

  const isMember = Array.isArray(boardMembers?.data)
    ? boardMembers.data.some(member =>
      member.id === currentUserId && member.pivot.role === "member"
    )
    : false;




  // console.log(currentWorkspaceId);
  useEffect(() => {
    if (currentWorkspaceId) {
      setWorkspace(currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  const handleCopy = () => {
    const payload = {
      name: title,
      workspace_id: workspace,
      source_board_id: boardId,
      keep_cards: keepCards,
      visibility: visibility,
    };


    copyBoard(payload, {
      onSuccess: (response) => {
        // console.log(response);
        onClose();
        const newBoardId = response.board.id; // Assuming the response contains the new board ID
        const newBoardName = response.board.name; // Assuming the response contains the new board ID
        navigate(`/b/${newBoardId}/${newBoardName}`);
      },
      onError: (error) => {
        console.error("❌ Lỗi khi sao chép bảng:", error);
      },
    });
  };

  // Hàm chọn quyền hiển thị bảng
  const handleVisibilityChange = (type) => {
    setVisibility(type);
    setShowChangePopover(false);
  };

  return (
    <>
      {/*  Popover chính */}
      <Popover
        open={open && !showChangePopover}
        anchorEl={anchorEl}
        onClose={onClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div style={{ padding: "10px", width: "300px" }}>
          {/*  Nút đóng Popover */}
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton>

          {/*  Tiêu đề */}
          <Typography
            variant="h6"
            sx={{ textAlign: "center", mb: 2, fontWeight: "bold" }}
          >
            Sao chép bảng thông tin
          </Typography>

          {/*  Nhập tiêu đề */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            Tiêu đề
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            size="small"
            placeholder="Ví dụ như 'kế hoạch bữa ăn hàng tuần' "
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />

          {/* Chọn không gian làm việc */}
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
              Không gian làm việc
            </Typography>
            <Select
              fullWidth
              value={workspace}
              onChange={(e) => setWorkspace(e.target.value)}
              sx={{ marginBottom: 2 }}
            >
              {(memoizedWorkspaces ?? []).map((ws) => (
                <MenuItem key={ws.id} value={ws.id}>
                  {ws.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Mô tả vị trí bảng */}
          <Typography variant="body2" sx={{ mb: 1 }}>
            {visibility === "private" ? (
              <>
                <LockIcon
                  color="error"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ ở chế độ <strong>Riêng tư.</strong>
              </>
            ) : visibility === "workspace" ? (
              <>
                <GroupIcon
                  color="warning"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ{" "}
                <strong>Hiển thị trong không gian làm việc.</strong>
              </>
            ) : (
              <>
                <PublicIcon
                  color="success"
                  sx={{ verticalAlign: "middle", mr: 1 }}
                />
                Bảng thông tin này sẽ ở chế độ <strong>Công khai.</strong>
              </>
            )}
            <span
              style={{ color: "#2475E7", cursor: "pointer" }}
              onClick={() => setShowChangePopover(true)}
            >
              {" "}
              thay đổi.
            </span>
          </Typography>

          {/* Checkbox giữ thẻ và thẻ mẫu */}
          <FormControlLabel
            control={
              <Checkbox
                checked={keepCards}
                onChange={() => setKeepCards(!keepCards)}
              />
            }
            label="Giữ các thẻ"
          />

          {/*  Thông báo */}
          <Typography variant="body2" sx={{ color: "gray", mt: 1 }}>
            Hoạt động, nhận xét và các thành viên sẽ không được sao chép sang
            bảng thông tin mới.
          </Typography>
          {isMember && (
            <Typography variant="body2" sx={{ color: "red", mt: 1, fontSize: "0.75rem" }}>
              Bạn không thể tạo bảng trong không gian làm việc này vì bạn là khách.
              Vui lòng chọn một không gian làm việc khác hoặc liên hệ với quản trị viên không gian làm việc.
            </Typography>
          )}

          {/* Nút Tạo mới */}
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={!title.trim() || isMember}
            onClick={handleCopy}

          >
            Tạo mới
          </Button>
        </div>
      </Popover>

      {/*  Popover "Thay đổi không gian làm việc" */}
      <Popover
        open={showChangePopover}
        anchorEl={anchorEl}
        onClose={() => setShowChangePopover(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <div style={{ padding: "10px", width: "300px" }}>
          {/*  Nút quay lại */}
          <IconButton
            onClick={() => setShowChangePopover(false)}
            sx={{ position: "absolute", top: 8, left: 8 }}
          >
            <ArrowBackIcon />
          </IconButton>

          {/*  Nút đóng Popover */}
          {/* <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon />
          </IconButton> */}

          {/*  Tiêu đề */}
          <Typography
            variant="h6"
            sx={{ textAlign: "center", marginBottom: "10px" }}
          >
            Sao chép bảng thông tin
          </Typography>

          {/*  Các tùy chọn */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("private")}
          >
            <LockIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Riêng tư</strong> - Chỉ thành viên bảng thông tin mới có
              quyền xem.
            </Typography>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("workspace")}
          >
            <GroupIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Không gian làm việc</strong> - Thành viên của Không gian
              làm việc có thể xem và sửa.
            </Typography>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "8px",
              cursor: "pointer",
            }}
            onClick={() => handleVisibilityChange("public")}
          >
            <PublicIcon color="success" sx={{ mr: 1 }} />
            <Typography variant="body2">
              <strong>Công khai</strong> - Bất kỳ ai trên internet đều có thể
              xem bảng thông tin này.
            </Typography>
          </div>
        </div>
      </Popover>
    </>
  );
};

export default Copy;
