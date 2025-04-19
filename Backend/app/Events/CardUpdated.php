<?php

namespace App\Events;

use App\Models\Card;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CardUpdated implements ShouldBroadcast
{
    use Dispatchable, SerializesModels, InteractsWithSockets;

    public $card;

    public function __construct(Card $card)
    {
        $this->card = $card;
    }

    public function broadcastOn()
    {
        // Load list_board nếu chưa có
        if (!$this->card->relationLoaded('list_board')) {
            $this->card->load('list_board');
        }

        $boardId = $this->card->list_board?->board_id;
        if (!$boardId) {
            Log::warning('CardUpdated: list_board or board_id missing for card', [
                'card_id' => $this->card->id,
                'list_board_id' => $this->card->list_board_id,
            ]);
            return [new Channel('card.' . $this->card->id)]; // Chỉ gửi trên card channel
        }

        Log::info('Broadcasting card.updated', [
            'card_channel' => 'card.' . $this->card->id,
            'board_channel' => 'board.' . $boardId,
        ]);

        return [
            new Channel('card.' . $this->card->id),
            new Channel('board.' . $boardId),
        ];
    }

    public function broadcastAs()
    {
        return 'card.updated';
    }

    public function broadcastWith()
    {
        // Load list_board nếu cần
        $card = $this->card->loadMissing('list_board');

        // Fetch labels
        $labels = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->select('labels.id as label_id', 'labels.title', 'labels.color_id')
            ->where('card_label.card_id', $card->id)
            ->get()
            ->map(function ($label) {
                return [
                    'id' => $label->label_id,
                    'name' => $label->title,
                    'color' => $label->color_id,
                ];
            });

        $labelIds = $labels->pluck('id');

        // Fetch member IDs
        $memberIds = DB::table('card_user')
            ->where('card_user.card_id', $card->id)
            ->pluck('user_id');

        // Fetch checklists IDs
        $checklistsIds = DB::table('checklists')
            ->where('card_id', $card->id)
            ->pluck('id');

        // Fetch badge-related counts
        $commentCount = DB::table('comment_cards')
            ->where('card_id', $card->id)
            ->count();

        $attachmentCount = DB::table('attachments')
            ->where('card_id', $card->id)
            ->count();

        $checklistStats = DB::table('checklists')
            ->leftJoin('checklist_items', 'checklists.id', '=', 'checklist_items.checklist_id')
            ->where('checklists.card_id', $card->id)
            ->selectRaw('
                COUNT(checklist_items.id) as total_checklist_items,
                SUM(checklist_items.is_completed) as completed_checklist_items
            ')
            ->first();

        // Construct the data payload
        $data = [
            'id' => $card->id,
            'title' => $card->title,
            'description' => $card->description,
            'thumbnail' => $card->thumbnail,
            'position' => (float) $card->position,
            'is_archived' => (bool) $card->is_archived,
            'list_board_id' => $card->list_board_id,
            'list_board_name' => $card->list_board ? $card->list_board->name : null,
            'labelId' => $labelIds,
            'labels' => $labels,
            'membersId' => $memberIds,
            'checklistsId' => $checklistsIds,
            'badges' => [
                'attachments' => (int) $attachmentCount,
                'comments' => (int) $commentCount,
                'start' => $card->start_date,
                'due' => $card->end_date,
                'dueTime' => $card->end_time,
                'dueReminder' => $card->reminder,
                'dueComplete' => (bool) $card->is_completed,
                'checkItems' => (int) ($checklistStats->total_checklist_items ?? 0),
                'checkItemsChecked' => (int) ($checklistStats->completed_checklist_items ?? 0),
                'description' => !empty($card->description),
            ],
        ];

        Log::info('CardUpdated payload', $data);
        return $data;
    }
}
