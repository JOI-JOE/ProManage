<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class WorkspaceResource extends JsonResource
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
            'name'             => $this->name,
            'display_name'     => $this->display_name,
            'boards'           => BoardResource::collection($this->boards),
            'desc'             => Str::limit($this->desc, 50),
            'permission_level' => $this->permission_level,
            'team_type'        => $this->team_type,
            'members'          => MembersResource::collection($this->members), // ✅ Thêm members vào đây
        ];
    }
}
