<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MembersResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'email'            => $this->email,
            'member_type'      => $this->pivot->member_type,
            'is_unconfirmed'   => $this->pivot->is_unconfirmed,
            'joined'           => $this->pivot->joined,
            'is_deactivated'   => $this->pivot->is_deactivated,
            'id_member_referrer' => $this->pivot->id_member_referrer,
            'last_active'      => $this->pivot->last_active,
        ];
    }
}
