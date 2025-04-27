  <!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Lời mời tham gia Promange</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; margin-top: 20px;">
      <!-- Header with Logo -->
      {{-- <tr>
        <td bgcolor="#ffffff" style="padding: 20px 30px; border-top-left-radius: 5px; border-top-right-radius: 5px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="200">
                <svg width="150" viewBox="0 0 300 80" xmlns="http://www.w3.org/2000/svg">
                  <!-- Background shape -->
                  <rect x="10" y="15" width="50" height="50" rx="6" fill="#0079BF" />
                  
                  <!-- Card elements similar to Trello -->
                  <rect x="17" y="23" width="16" height="14" rx="2" fill="white" opacity="0.9" />
                  <rect x="37" y="23" width="16" height="22" rx="2" fill="white" opacity="0.9" />
                  <rect x="17" y="41" width="16" height="17" rx="2" fill="white" opacity="0.9" />
                  
                  <!-- Text -->
                  <text x="70" y="48" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#253858">
                    Promange
                  </text>
                  
                  <!-- Tagline -->
                  <text x="70" y="65" font-family="Arial, sans-serif" font-size="12" fill="#5E6C84">
                    Task Management
                  </text>
                </svg>
              </td>
            </tr>
          </table>
        </td>
      </tr> --}}

      <!-- Main Content -->
      <tr>
        <td bgcolor="#ffffff" style="padding: 0 30px 40px 30px;">
          <table border="0" cellpadding="0" cellspacing="0" width="100%">
            <!-- Invitation Header -->
            <tr>
              <td style="color: #153643; font-size: 24px; font-weight: bold; text-align: left; padding: 30px 0 15px 0;">
                {{ $userName }} đã mời bạn tham gia Không gian làm việc "{{ $workspaceName }}"
              </td>
            </tr>

            <!-- Personal Message -->
            <tr>
              <td style="padding: 10px 0 20px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                <strong>Lời nhắn từ người mời:</strong>
                <p style="margin: 10px 0 0 0; padding: 15px; background-color: #f5f6f8; border-radius: 5px; font-style: italic;">{{ $messageContent }}</p>
              </td>
            </tr>

            <!-- Description -->
            <tr>
              <td style="padding: 0 0 25px 0; color: #153643; font-size: 16px; line-height: 24px; text-align: left;">
                Tham gia cùng họ trên Promange để cộng tác và đạt đỉnh năng suất mới.
              </td>
            </tr>

            <!-- CTA Button -->
            <tr>
              <td align="center" style="padding-bottom: 30px;">
                <a href="{{ $invite_link }}" style="background-color: #0052cc; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold; font-size: 16px;">
                  Đi đến Không gian làm việc
                </a>
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
                  Hãy tưởng tượng một chiếc bảng trắng, dán đầy danh sách công việc, mỗi công việc tương đương với một tác vụ. Bạn có thể theo dõi, cộng tác và đạt hiệu quả tối đa.
                </p>
              </td>
            </tr>

            <!-- Learn More -->
            <tr>
              <td style="padding: 10px 0 0 0; color: #153643; font-size: 16px; line-height: 24px;">
                Hãy tham gia ngay để trải nghiệm Promange!
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
                <p style="margin: 0;">&copy; 2025 Promange. All rights reserved.</p>
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