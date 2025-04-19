<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>{{ $subject }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f5f7;
            margin: 0;
            padding: 0;
            color: #172b4d;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            text-align: center;
            padding: 20px;
            background-color: #0079bf;
        }
        .header img {
            max-width: 120px;
            height: auto;
        }
        .content {
            padding: 20px;
        }
        .heading {
            font-size: 20px;
            font-weight: bold;
            color: #172b4d;
            margin-bottom: 20px;
        }
        .notification-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .avatar {
            width: 32px;
            height: 32px;
            background-color: #0079bf;
            color: #ffffff;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            margin-right: 10px;
            flex-shrink: 0;
        }
        .notification-text {
            font-size: 14px;
            color: #172b4d;
        }
        .notification-text strong {
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            font-size: 12px;
            color: #5e6c84;
            background-color: #f4f5f7;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://your-logo-url.com/logo.png" alt="ProManage Logo">
        </div>
        <div class="content">
            <div class="heading">{{ $heading }}</div>
            @foreach($notifications as $notification)
                <div class="notification-item">
                    <div class="avatar">{{ strtoupper(substr($notification['user_name'], 0, 1)) }}</div>
                    <div class="notification-text">
                        <strong>{{ $notification['user_name'] }}</strong> {{ $notification['action'] }} trong {{ $notification['context'] }}
                    </div>
                </div>
            @endforeach
        </div>
        <div class="footer">
            <p>Đây là email tự động từ ProManage. Vui lòng không trả lời email này.</p>
        </div>
    </div>
</body>
</html>