import { useWorkspace } from "../../contexts/WorkspaceContext";
import HomeBoard from "./home";

const Boards = () => {
    const { workspaces } = useWorkspace();
    return (
        <HomeBoard workspaces={workspaces || []} />
    )
}
export default Boards;
