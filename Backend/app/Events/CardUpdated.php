<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CardUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public $card;
    protected $memberData;
    protected $memberIds;
    protected $labelIds;
    protected $formattedLabels;

    public function __construct(Card $card)
    {
        $this->card = $card->load(['members', 'labels', 'list_board']);

        // Format member data
        $this->memberData = $this->card->members->map(function ($member) {
            return [
                'id' => $member->id,
                'full_name' => $member->full_name ?? '',
                'user_name' => $member->user_name ?? '',
            ];
        })->toArray();

        // Extract member IDs
        $this->memberIds = array_column($this->memberData, 'id');

        // Extract label IDs
        $this->labelIds = $this->card->labels->pluck('id')->toArray();

        // Format labels
        $this->formattedLabels = $this->card->labels->map(function ($label) {
            return [
                'id' => $label->id,
                'title' => $label->title ?? '',
                'color' => $label->color->hex_code ?? null,
            ];
        })->toArray();
    }

    public function broadcastOn()
    {
        if (!$this->card->list_board || !$this->card->list_board->board_id) {
            Log::warning('Missing list_board or board_id for CardUpdated broadcast', [
                'card_id' => $this->card->id,
            ]);
            return new Channel('board.invalid');
        }
        return new Channel('board.' . $this->card->list_board->board_id);
    }

    public function broadcastAs()
    {
        return 'card.updated';
    }

    public function broadcastWith()
    {
        $data = [
            'id' => $this->card->id,
            'list_board_id' => $this->card->list_board_id,
            'title' => $this->card->title ?? '',
            'position' => (float)$this->card->position,
            'description' => $this->card->description ?? '',
            'thumbnail' => $this->card->thumbnail,
            'start_date' => $this->card->start_date,
            'end_date' => $this->card->end_date,
            'end_time' => $this->card->end_time,
            'reminder' => $this->card->reminder,
            'is_completed' => (bool)$this->card->is_completed,
            'is_archived' => (bool)$this->card->is_archived,
            'badges' => [
                'checkItems' => (int)($this->card->total_checklist_items ?? 0),
                'checkItemsChecked' => (int)($this->card->completed_checklist_items ?? 0),
                'attachments' => (int)($this->card->attachment_count ?? $this->card->attachments()->count()),
                'comments' => (int)($this->card->comment_count ?? $this->card->comments()->count()),
                'start' => $this->card->start_date,
                'due' => $this->card->end_date,
                'dueTime' => $this->card->end_time,
                'dueReminder' => $this->card->reminder,
                'dueComplete' => (bool)$this->card->is_completed,
                'description' => is_string($this->card->description) && trim(strip_tags($this->card->description)) !== '',
            ],
            'membersId' => $this->memberIds ?? [],
            'members' => $this->memberData ?? [],
            'labelId' => $this->labelIds ?? [],
            'labels' => $this->formattedLabels ?? [],
        ];

        Log::info('Broadcasting card updated event', ['thumnail' => $this->card->thumbnail]);

        return $data;
    }
}
