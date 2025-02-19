// import React from "react";
// import { useNavigate } from "react-router-dom";

// const Dashboard = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     const role = localStorage.getItem("role");
//     if (role !== "admin") {
//       navigate("/"); // Chặn member truy cập
//     }
//   }, [navigate]);
//   return <div>Dashboard</div>;
// };

// export default Dashboard;

import { useEffect, useState } from "react";

const Dashboard = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      window.location.href = "/login"; // Nếu không có token, quay về trang đăng nhập
      return;
    }

    fetch("http://127.0.0.1:8000/api/auth/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // Gửi token để xác thực
      },
    })
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => {
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      });
  }, []);

  return (
    <div>
      {user ? (
        <div>
          <h2>Welcome, {user.name}</h2>
          <img src={user.avatar} alt="Avatar" />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;