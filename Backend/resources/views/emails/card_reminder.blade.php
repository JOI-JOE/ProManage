<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Nhắc nhở: {{ $cardTitle }}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px;">
      <!-- Main Content -->
      <tr>
        <td bgcolor="#ffffff" style="padding: 0 30px 40px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Greeting -->
            <tr>
              <td style="color: #153643; font-size: 18px; text-align: left; padding: 20px 0 10px 0;">
                {{ $greeting }}
              </td>
            </tr>

            <!-- Reminder Header -->
            <tr>
              <td style="color: #153643; font-size: 24px; font-weight: bold; text-align: left; padding: 10px 0 15px 0;">
                Nhắc nhở: Thẻ "{{ $cardTitle }}"
              </td>
            </tr>

            <!-- Task Message -->
            <tr>
              <td style="padding: 10px 0 20px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                {{ $taskMessage }}
              </td>
            </tr>

            <!-- Card Details -->
            <tr>
              <td style="padding: 10px 0 20px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                <p style="margin: 0;">{{ $cardMessage }}</p>
                <p style="margin: 5px 0 0 0;">{{ $deadlineMessage }}</p>
              </td>
            </tr>

            <!-- Description -->
            <tr>
              <td style="padding: 0 0 25px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                Xem chi tiết thẻ trên bảng "{{ $boardName }}" để cập nhật tiến độ công việc.
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <a href="{{ $cardLink }}" style="background-color: #0052cc; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Xem chi tiết
                </a>
              </td>
            </tr>

            <!-- Check Message -->
            <tr>
              <td style="padding: 0 0 15px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                {{ $checkMessage }}
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td>
                <hr style="border: none; border-top: 1px solid #e1e4e8; margin: 0 0 25px 0;">
              </td>
            </tr>

            <!-- What is Promange -->
            <tr>
              <td style="padding: 0 0 15px 0; color: #153643; font-size: 16px; line-height: 24px;">
                <strong>Promange là gì?</strong> 
                <p style="margin: 10px 0 0 0;">
                  Promange giúp bạn quản lý công việc với các bảng, danh sách và thẻ. Cộng tác dễ dàng và đạt hiệu quả tối đa.
                </p>
              </td>
            </tr>

            <!-- Learn More -->
            <tr>
              <td style="padding: 10px 0 0 0; color: #153643; font-size: 16px; line-height: 24px;">
                Khám phá thêm về Promange!
                <a href="https://promange.com/about" style="color: #0079bf; text-decoration: underline; font-weight: bold;">Tìm hiểu thêm</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td bgcolor="#f0f0f0" style="padding: 20px 30px; text-align: center; border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="color: #42526e; font-size: 14px; line-height: 20px;">
                <p style="margin: 0;">© 2025 Promange. All rights reserved.</p>
                <p style="margin: 8px 0 0 0;">
                  <a href="#" style="color: #0052cc; text-decoration: none; margin: 0 10px;">Điều khoản sử dụng</a> | 
                  <a href="#" style="color: #0052cc; text-decoration: none; margin: 0 10px;">Chính sách bảo mật</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>