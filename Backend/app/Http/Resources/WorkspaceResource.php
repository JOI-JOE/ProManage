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
            'id'                        => $this->id,
            'name'                      => $this->name,
            'display_name'              => $this->display_name,
            'desc'                      => Str::limit($this->desc, 50),
            'logo_hash'                 => Str::limit($this->logo_hash, 30),
            'logo_url'                  => Str::limit($this->logo_url, 30),
            'permission_level'          => $this->permission_level,
            'board_invite_restrict'     => $this->board_invite_restrict,
            'org_invite_restrict'       => json_decode($this->org_invite_restrict),
            'board_delete_restrict'     => json_decode($this->board_delete_restrict), // Decode JSON string
            'board_visibility_restrict' => json_decode($this->board_visibility_restrict), // Decode JSON string
            'team_type'                 => $this->team_type,
        ];
    }
}
