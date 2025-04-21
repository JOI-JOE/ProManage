<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Str;

class WorkspaceResource extends JsonResource
{
    public function toArray($request)
    {
        // $this->resource là mảng $workspaceData đã được truyền vào
        return [
            'id' => $this->resource['id'],
            'name' => $this->resource['name'],
            'display_name' => $this->resource['display_name'],
            'desc' => $this->resource['desc'],
            'logo_hash' => $this->resource['logo_hash'],
            'logo_url' => $this->resource['logo_url'],
            'permission_level' => $this->resource['permission_level'],
            'team_type' => $this->resource['team_type'],
            'created_at' => $this->resource['created_at'],
            'updated_at' => $this->resource['updated_at'],
            'members' => $this->resource['members'],
            'boards' => $this->resource['boards'],
            'markedBoards' => $this->resource['markedBoards'],
        ];
    }
}
