<?php

namespace App\Jobs;

use App\Models\ChecklistItem;
use App\Models\User;
use App\Notifications\ChecklistItemMemberNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendChecklistItemNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $checklistItem;
    protected $targetUser;
    protected $action; // added or removed
    protected $causer;

    public function __construct(ChecklistItem $checklistItem, User $targetUser, string $action, User $causer)
    {
        $this->checklistItem = $checklistItem;
        $this->targetUser = $targetUser;
        $this->action = $action;
        $this->causer = $causer;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        \Log::info('Test job executed!');
        if ($this->targetUser->id !== $this->causer->id) {
            $this->targetUser->notify(
                new ChecklistItemMemberNotification($this->checklistItem, $this->targetUser, $this->action, $this->causer)
            );
        }
    }
}
