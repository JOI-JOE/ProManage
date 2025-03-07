<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BoardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,                     // ID của board
            'name' => $this->name,                 // Tên của board
            'thumbnail' => $this->thumbnail,       // Ảnh thu nhỏ của board
            // 'description' => $this->description,   // Mô tả của board
            // 'is_marked' => $this->is_marked,       // Trạng thái đánh dấu (boolean)
            // 'archive' => $this->archive,           // Trạng thái lưu trữ (boolean)
            'closed' => $this->closed,           // Trạng thái lưu trữ (boolean)
            // 'created_by' => $this->created_by,           // Lưu người tạo bảng 
            // 'visibility' => $this->visibility,     // Tính công khai (public hoặc private)
            // 'workspace_id' => $this->workspace_id, // ID của workspace liên quan
            // 'created_at' => $this->created_at,     // Thời gian tạo board
            // 'updated_at' => $this->updated_at,     // Thời gian cập nhật board
        ];
    }
}
