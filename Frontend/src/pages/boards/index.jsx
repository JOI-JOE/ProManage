import { useWorkspace } from "../../contexts/WorkspaceContext";
import HomeBoard from "./home";

const Boards = () => {
    const { workspaces, isLoading } = useWorkspace();
    return (
        <HomeBoard workspaces={workspaces || []} workspaceLoading={isLoading} />
    )

}
export default Boards;
