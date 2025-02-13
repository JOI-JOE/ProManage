Bảng workspace_members
/*
 * Các trường hợp để phân biệt trạng thái 'joined' và 'confirmed':
 *
 * 1. Người dùng đăng ký thành công (tạo tài khoản), nhưng chưa xác nhận email:
 *    - is_unconfirmed = true  (chưa xác nhận)
 *    - joined = false (chưa tham gia)
 *
 * 2. Người dùng đã xác nhận email:
 *    - is_unconfirmed = false (đã xác nhận)
 *    - joined = false (chưa tham gia)
 *
 * 3. Người dùng đã tham gia vào một nhóm/sự kiện:
 *    - is_unconfirmed = false (đã xác nhận)
 *    - joined = true (đã tham gia)
 *
 * 4. Người dùng bị từ chối tham gia (ví dụ: quản trị viên từ chối):
 *    - is_unconfirmed = false (đã xác nhận)
 *    - joined = false (chưa tham gia)
 *
 * 5. Người dùng tự rời khỏi nhóm/sự kiện:
 *    - is_unconfirmed = false (đã xác nhận)
 *    - joined = false (chưa tham gia)
 *
 * 6. (Tùy chọn) Người dùng được mời tham gia, nhưng chưa chấp nhận lời mời:
 *    - is_unconfirmed = true/false (tùy thuộc vào quy trình)
 *    - joined = false (chưa tham gia)
 *
 * 7. (Tùy chọn) Người dùng đã chấp nhận lời mời, nhưng chưa được phê duyệt:
 *    - is_unconfirmed = true/false (tùy thuộc vào quy trình)
 *    - joined = false (chưa tham gia)
 */


