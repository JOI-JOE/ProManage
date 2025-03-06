<?php

use Illuminate\Support\Facades\Event;
use App\Events\ActivityEvent;
use Tests\TestCase;

class CardControllerTest extends TestCase
{
    public function test_broadcasts_activity_event_when_member_is_added_to_card()
    {
        // Giả lập sự kiện
        Event::fake();
        $cardId = 2;

        // Gửi yêu cầu thêm thành viên vào card
        $response = $this->post(route('card.addMember', ['cardId' => $cardId]), [
            'user_id' => 2,
            'email' => 'hoangnvph45665@fpt.edu.vn',
        ]);

        // Kiểm tra sự kiện đã được broadcast chưa
        Event::assertDispatched(ActivityEvent::class);
    }
}
