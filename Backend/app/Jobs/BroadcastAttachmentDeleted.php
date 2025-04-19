<?php

namespace App\Jobs;

use App\Events\AttachmentDeleted;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BroadcastAttachmentDeleted implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $attachmentId;
    protected $cardId;

    public function __construct($attachmentId, $cardId)
    {

        $this->attachmentId = $attachmentId;
        $this->cardId = $cardId; // Lấy ID của card
    }

    public function handle()
    {
        // Gửi sự kiện AttachmentDeleted với ID của attachment và card
        Log::info('Broadcasting AttachmentDeleted', [
            'attachment_id' => $this->attachmentId,
            'card_id' => $this->cardId,
        ]);
        broadcast(new AttachmentDeleted($this->attachmentId, $this->cardId))->toOthers();
    }
}
