import { useGetWorkspaces } from "../../hooks/useWorkspace";
import HomeBoard from "./home";

const Boards = () => {
    const { data = {}, isLoading, isError } = useGetWorkspaces();
    const { workspaces = [], id: userId } = data; // Destructure trực tiếp

    return (
        <HomeBoard workspaces={workspaces} userId={userId} />
    )
}
export default Boards;
