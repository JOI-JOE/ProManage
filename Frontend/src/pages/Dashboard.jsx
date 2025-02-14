import React from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "admin") {
      navigate("/"); // Chặn member truy cập
    }
  }, [navigate]);
  return <div>Dashboard</div>;
};

export default Dashboard;
