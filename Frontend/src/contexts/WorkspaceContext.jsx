import { createContext, useContext } from 'react'

const WorkspaceContext = createContext(null)

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext)
    if (!context) {
        throw new Error("useWorkspace() phải được xử dụng trong WorkspaceProvider")
    }
    return context
}

export default WorkspaceContext