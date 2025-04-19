@component('mail::message')
# Nhắc nhở {{ $type }}: {{ $card->title }}

Xin chào,

Bạn có một công việc cần chú ý:

**📌 Thẻ: {{ $card->title }}**  
⏳ {{ $message }}: {{ $deadline }}

@component('mail::button', ['url' => $url])
Xem chi tiết
@endcomponent

Vui lòng kiểm tra ngay để không bỏ lỡ!

Trân trọng,  
ProManage
@endcomponent