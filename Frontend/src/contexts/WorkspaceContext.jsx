import { createContext, useContext } from 'react'
import { useGetWorkspaces } from '../hooks/useWorkspace';

const WorkspaceContext = createContext();

export const WorkspaceProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(null);

  // Gọi API lấy danh sách workspace mà user tham gia
  const { data: workspaces, isLoading, isError } = useGetWorkspaces();

  // Mặc định chọn workspace đầu tiên nếu chưa có workspace nào được chọn
  useEffect(() => {
    if (workspaces && workspaces.length > 0 && !currentWorkspace) {
      setCurrentWorkspace(workspaces[0]);
    }
  }, [workspaces]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspace, setCurrentWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export default WorkspaceContext;

// // Custom hook để sử dụng context dễ dàng hơn
// export const useWorkspace = () => {
//   return useContext(WorkspaceContext);
// };