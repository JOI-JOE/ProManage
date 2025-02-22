import React from "react";
import { useUser } from "../hooks/useUser";

const Home = () => {
    const { data: user, isLoading, isError, error } = useUser(); // Sử dụng useUser

    if (isLoading) {
        return <div>Đang tải thông tin người dùng...</div>;
    }

    if (isError) {
        return <div>Lỗi: {error.message}</div>; // Hoặc thông báo lỗi thân thiện hơn
    }

    return (
        <div>
            <h1>Chào mừng em đến với thế giới của anh</h1>
            {user && (
                <a href={`u/${user.user_name}/boards`}>Xem thông tin người dùng</a>
            )}
        </div>
    );
};

export default Home;