<?php

namespace App\Jobs;

use App\Events\AttachmentCreated;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class BroadcastAttachmentCreated implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $attachment;

    public function __construct($attachment)
    {
        $this->attachment = $attachment;
    }

    public function handle()
    {
        broadcast(new AttachmentCreated($this->attachment))->toOthers();
    }
}
