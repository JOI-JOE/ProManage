import { useWorkspace } from "../../contexts/WorkspaceContext";
import HomeBoard from "./home";

const Boards = () => {
    const { data } = useWorkspace();
    return (
        <HomeBoard workspaces={data?.workspaces || []} />
    )
}
export default Boards;
