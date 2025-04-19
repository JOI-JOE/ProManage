<?php

namespace App\Jobs;

use App\Events\AttachmentUpdated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BroadcastAttachmentUpdated implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $attachment;
    protected $cardId;

    public function __construct($attachment, $cardId)
    {
        $this->attachment = $attachment;
        $this->cardId = $cardId;
    }

    public function handle()
    {
        broadcast(new AttachmentUpdated($this->attachment, $this->cardId))->toOthers();
    }
}