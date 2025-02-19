import React from "react"
import axios from "axios";

const Home = () => {

  const token = localStorage.getItem("token");

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8000/api/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      localStorage.removeItem("token"); // Xóa token trên client
      localStorage.removeItem("role");
      window.location.reload(); // Reload trang hoặc chuyển hướng
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div>
      <h1>Home</h1>
      {token ? (
        <button onClick={handleLogout}>Logout</button>
      ) : (
        <a href="/login">Login</a>
      )}
    </div>
  );
}

export default Home