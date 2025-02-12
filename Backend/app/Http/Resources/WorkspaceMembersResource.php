<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkspaceMembersResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'id_workspace' => $this->id_workspace,
            'id_member' => $this->id_member,
            'member_type' => $this->member_type,
            'is_unconfirmed' => $this->is_unconfirmed,
            'is_deactivated' => $this->is_deactivated,
            'activity_blocked' => $this->activity_blocked,
            'id_member_referrer' => $this->id_member_referrer,
            'last_active' => $this->last_active,
            // 'created_at' => $this->created_at,
            // 'updated_at' => $this->updated_at,
        ];
    }
}
