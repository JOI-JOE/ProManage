<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;

class CardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        // Tính toán số lượng checklist items và số lượng đã hoàn thành
        $checklistStats = $this->calculateChecklistStats();

        // Lấy badges cho card
        $badges = $this->getBadges($checklistStats);

        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'thumbnail' => $this->thumbnail,
            'position' => (float)$this->position,
            'is_archived' => (bool)$this->is_archived,
            'list_board_id' => $this->list_board_id,
            'list_board_name' => $this->whenLoaded('listBoard', function () {
                return $this->listBoard->name;
            }),
            'labelId' => $this->labels->pluck('id'),
            'labels' => $this->labels->map(function ($label) {
                return [
                    'id' => $label->id,
                    'name' => $label->title,
                    'color' => $label->color_id,
                ];
            }),
            'membersId' => $this->users->pluck('id'),
            'checklistsId' => $this->checklists->pluck('id'),
            'badges' => $badges,
        ];
    }

    /**
     * Calculate checklist statistics
     *
     * @return array
     */
    private function calculateChecklistStats()
    {
        return [
            'total' => DB::table('checklists')
                ->join('checklist_items', 'checklists.id', '=', 'checklist_items.checklist_id')
                ->where('checklists.card_id', $this->id)
                ->count(),

            'completed' => DB::table('checklists')
                ->join('checklist_items', 'checklists.id', '=', 'checklist_items.checklist_id')
                ->where('checklists.card_id', $this->id)
                ->where('checklist_items.is_completed', 1)
                ->count()
        ];
    }

    /**
     * Get badges for card
     *
     * @param array $checklistStats
     * @return array
     */
    private function getBadges($checklistStats)
    {
        return [
            'attachments' => $this->attachments->count(),
            'comments' => $this->comments->count(),
            'start' => $this->start_date,
            'due' => $this->end_date,
            'dueTime' => $this->end_time,
            'dueReminder' => $this->reminder,
            'dueComplete' => (bool)$this->is_completed,
            'checkItems' => $checklistStats['total'],
            'checkItemsChecked' => $checklistStats['completed'],
            'description' => !empty($this->description),
        ];
    }
}
