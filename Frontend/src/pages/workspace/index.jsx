import React from 'react'
import HomeWorkspace from './home'
import { useParams } from 'react-router-dom';

const Workspaces = () => {
    let { displayName } = useParams();

    const workspaces = [
        {
            name: 'Vu',
            initial: 'V',
            display_name: 'vu109',
            desc: 'đây là test dữ liệu',
            boards: [
                { name: "Bảng thiết kế trang chủ", link: "/boards/4" },
                { name: "Bảng thiết kế trang sản phẩm", link: "/boards/5" },
                { name: "Bảng thiết kế trang liên hệ", link: "/boards/6" }
            ]

        },
        {
            name: 'Vito',
            initial: 'V',
            display_name: 'vito109',
            desc: 'đây là test dữ liệu',
            boards: [
                { name: "Bảng thiết kế trang sản phẩm", link: "/boards/5" },
                { name: "Bảng thiết kế trang liên hệ", link: "/boards/6" }
            ]
        }
    ]

    const workspace = workspaces.find(ws => ws.display_name === displayName);

    if (!workspace) {
        return <div>Workspace not found</div>;
    }

    return (
        <>
            <HomeWorkspace workspace={workspace} />
        </>
    )
}

export default Workspaces