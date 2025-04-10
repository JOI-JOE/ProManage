import React from "react";
import { Button } from "@mui/material";
import { useMe } from "../contexts/MeContext";
import anh1 from "../assets/anh1.png"; // Đường dẫn chính xác tới file ảnh
const Home = () => {
  const { user } = useMe();

  return (
    <div className="bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen font-sans">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-teal-700 font-bold text-lg">ProManage</div>
        <div className="space-x-4">
          {user && (
            <Button
              variant="contained"
              href={`u/${user.user_name}/boards`}
              sx={{
                fontSize: "0.8rem",
                fontWeight: "bold",
                backgroundColor: "teal",
                "&:hover": { backgroundColor: "#00635a" },
                borderRadius: "8px",
                textTransform: "none",
                boxShadow: "0 4px 6px rgba(0, 128, 128, 0.15)",
                py: 0.75,
                px: 2,
              }}
            >
              Đến workspaces của bạn
            </Button>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-6 py-8 md:py-16">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left Content */}
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="w-16 h-0.5 bg-teal-500 mb-4"></div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              <span className="text-teal-600">ProManage</span> - Phần mềm quản
              lý công việc trực tuyến
            </h1>
            <p className="text-sm text-gray-600 mb-6">
              Bạn đang tìm kiếm một công cụ giúp sắp xếp công việc cá nhân và
              nhóm một cách trực quan, khoa học? ProManage chính là trợ thủ đắc
              lực dành cho bạn!
            </p>
            <div className="space-y-3 mb-8">
              <div className="flex items-center">
                <div className="bg-teal-500 rounded-full p-0.5 mr-2">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-700 text-xs font-medium">
                  Dễ sử dụng với giao diện trực quan
                </p>
              </div>
              <div className="flex items-center">
                <div className="bg-teal-500 rounded-full p-0.5 mr-2">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-700 text-xs font-medium">
                  Tiết kiệm thời gian với các tính năng tự động
                </p>
              </div>
              <div className="flex items-center">
                <div className="bg-teal-500 rounded-full p-0.5 mr-2">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </div>
                <p className="text-gray-700 text-xs font-medium">
                  Thúc đẩy năng suất làm việc nhóm
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="md:w-1/2 md:pl-8">
            <div className="relative">
              <div className="absolute -inset-1  from-teal-400  rounded-lg blur opacity-25"></div>
              <div className="relative bg-white rounded-lg  overflow-hidden">
                <img
                  src={anh1}
                  alt="ProManage Dashboard Preview"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-8 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold text-gray-800">
            Tại sao chọn <span className="text-teal-600">ProManage</span>?
          </h2>
          <div className="w-16 h-0.5 bg-teal-500 mx-auto mt-3"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                ></path>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Bảng công việc trực quan
            </h3>
            <p className="text-xs text-gray-600">
              Sắp xếp công việc theo trạng thái và mức độ ưu tiên với giao diện
              kéo thả linh hoạt.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Quản lý nhóm hiệu quả
            </h3>
            <p className="text-xs text-gray-600">
              Phân công công việc, theo dõi tiến độ và đảm bảo mọi thành viên
              đều nắm rõ trách nhiệm.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-lg p-5 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="bg-teal-100 rounded-full w-10 h-10 flex items-center justify-center mb-4">
              <svg
                className="w-5 h-5 text-teal-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <h3 className="text-sm font-bold text-gray-800 mb-2">
              Báo cáo và thống kê
            </h3>
            <p className="text-xs text-gray-600">
              Theo dõi hiệu suất qua các biểu đồ trực quan, giúp đưa ra quyết
              định dựa trên dữ liệu thực tế.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-700 py-10">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-white mb-3">
            Sẵn sàng tối ưu hóa công việc của bạn?
          </h2>
          <p className="text-teal-100 text-xs mb-6 max-w-2xl mx-auto">
            Hãy đăng ký ngay hôm nay để trải nghiệm cách ProManage có thể giúp
            bạn và đội nhóm làm việc hiệu quả hơn.
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-6">
        <div className="container mx-auto px-6">
          <div className="text-center text-gray-500 text-xs">
            &copy; {new Date().getFullYear()} ProManage. Tất cả các quyền được
            bảo lưu.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
