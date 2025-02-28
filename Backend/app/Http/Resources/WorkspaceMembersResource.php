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
            // 'id' => $this->id,
            // 'id_workspace' => $this->id_workspace,
            'email' => $this->user->email,
            'name' => $this->user->full_name,
            'is_deactivated' => (bool) $this->is_deactivated, // Convert to boolean
            'activity_blocked' => $this->activity_blocked === null ? false : (bool) $this->activity_blocked, // Handle null and convert
            'member_type' => $this->member_type,
            // 'last_active' => , // Handle null and convert
            // 'is_unconfirmed' => $this->is_unconfirmed,
            // 'id_member_referrer' => $this->id_member_referrer,
        ];
    }
}
