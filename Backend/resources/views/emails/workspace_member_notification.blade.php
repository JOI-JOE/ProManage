<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Thông báo Không gian làm việc</title>
    <style>
      @media only screen and (max-width: 600px) {
        .inner-body {
          width: 100% !important;
        }
        .button {
          width: 100% !important;
        }
      }

      body {
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
          Noto Sans, Ubuntu, Droid Sans, Helvetica Neue, sans-serif;
        color: #172b4d;
        margin: 0;
        padding: 0;
        width: 100% !important;
        -webkit-text-size-adjust: none;
        line-height: 1.6;
      }

      .wrapper {
        background-color: #f4f5f7;
        margin: 0;
        padding: 30px 0;
        width: 100%;
      }

      .logo-container {
        text-align: center;
        margin-bottom: 20px;
      }

      .logo {
        max-height: 50px;
        width: auto;
      }

      .content {
        background-color: white;
        border-radius: 3px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        margin: 0 auto;
        max-width: 600px;
        padding: 20px;
      }

      .header {
        font-size: 24px;
        font-weight: normal;
        margin-top: 0;
        margin-bottom: 25px;
      }

      .notification-item {
        padding: 10px 0;
        border-bottom: 1px solid #dfe1e6;
      }

      .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #0079bf;
        color: white;
        font-weight: bold;
        display: inline-block;
        text-align: center;
        line-height: 36px;
        margin-right: 10px;
        vertical-align: middle;
      }

      .avatar img {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        object-fit: cover;
      }

      .notification-content {
        display: inline-block;
        vertical-align: middle;
        width: calc(100% - 60px);
      }

      .button {
        display: inline-block;
        background-color: #0052cc;
        color: white !important;
        padding: 10px 20px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 500;
        text-align: center;
        margin: 20px 0;
      }

      .button:hover {
        background-color: #003087;
      }

      .footer {
        color: #5e6c84;
        font-size: 12px;
        text-align: center;
        margin-top: 30px;
      }

      a {
        color: #0052cc;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }
    </style>
  </head>
  <body>
    <div class="wrapper">
      <!-- Logo ProManage -->
      <div class="content">
        <h1 class="header">Thông báo Không gian làm việc</h1>

        <div class="notification-item">
          <div class="avatar">
            @if($inviter->image)
              <img src="{{ $inviter->image }}" alt="{{ $inviter->full_name }}" />
            @else
              <img
                src="https://static.vecteezy.com/system/resources/previews/026/619/142/original/default-avatar-profile-icon-of-social-media-user-photo-image-vector.jpg"
                alt="{{ $inviter->user_name }}"
              />
            @endif
          </div>
          <div class="notification-content">
            @switch($action_type)
              @case('invite')
                <p>
                  <strong>{{ $inviter->full_name }}</strong> đã mời bạn tham gia Không gian làm việc
                  <a href="{{ $url }}">{{ $workspace->display_name }}</a>.
                </p>
                @break
              @case('add')
                <p>
                  <strong>{{ $inviter->full_name }}</strong> đã thêm bạn vào Không gian làm việc
                  <a href="{{ $url }}">{{ $workspace->display_name }}</a>.
                </p>
                @break
              @case('remove')
                <p>
                  <strong>{{ $inviter->full_name }}</strong> đã xóa bạn khỏi Không gian làm việc
                  <a href="{{ $url }}">{{ $workspace->display_name }}</a>.
                </p>
                @break
              @case('remove_request')
                <p>
                  <strong>{{ $inviter->full_name }}</strong> đã hủy yêu cầu tham gia của bạn vào Không gian làm việc
                  <a href="{{ $url }}">{{ $workspace->display_name }}</a>.
                </p>
                @break
              @default
                <p>
                  Có cập nhật liên quan đến Không gian làm việc
                  <a href="{{ $url }}">{{ $workspace->display_name }}</a>.
                </p>
            @endswitch
          </div>
        </div>

        <div class="footer">
          <p>Cảm ơn bạn đã sử dụng hệ thống của chúng tôi!</p>
        </div>
      </div>
    </div>
  </body>
</html>