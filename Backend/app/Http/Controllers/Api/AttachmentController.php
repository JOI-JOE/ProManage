<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AttachmentController extends Controller
{
    // Lấy danh sách file đính kèm của một thẻ
    public function getAttachments($cardId)
    {
        $attachments = Attachment::where('card_id', $cardId)->get();

        return response()->json([
            'message' => 'Lấy danh sách tệp đính kèm thành công!',
            'status' => true,
            'data' => $attachments
        ]);
    }

    // Upload file đính kèm
    public function uploadAttachment(Request $request, $cardId)
    {
        $request->validate([
            'file' => 'required|file|max:10240', // Giới hạn 10MB
        ]);

        $file = $request->file('file');
        $fileNameDefault = $file->getClientOriginalName();
        $fileName = time() . '_' . $fileNameDefault;
        $path = $file->storeAs('attachments', $fileName, 'public');

        $attachment = Attachment::create([
            'path_url' => $path,
            'file_name_defaut' => $fileNameDefault,
            'file_name' => $fileName,
            'is_cover' => false,
            'card_id' => $cardId,
        ]);

        return response()->json([
            'message' => 'Tệp đã được tải lên thành công!',
            'status' => true,
            'data' => $attachment,
        ]);
    }

    // Xóa file đính kèm
    public function deleteAttachment($cardId,$attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);

        Storage::disk('public')->delete($attachment->path_url);
        $attachment->delete();

        return response()->json([
            'message' => 'Xóa tệp đính kèm thành công!',
            'status' => true,
        ]);
    }
    // tải ảnh bìa lên
    public function uploadCover(Request $request,$cardId)
    {
        $request->validate([
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $file = $request->file('image');
            $fileNameDefault = $file->getClientOriginalName();
            $fileName = time() . '_' . $fileNameDefault;

            // Lưu ảnh vào thư mục public/uploads
            $filePath = $file->store('attachments', 'public');
            Attachment::where('card_id', $cardId)->where('is_cover', true)->update(['is_cover' => false]);

            // Lưu vào database
            $attachment = Attachment::create([
                'path_url' => $filePath,
                'file_name_defaut' => $fileNameDefault,
                'file_name' => $fileName,
                'is_cover' => true,
                'card_id' => $cardId, // ID của card (hoặc sản phẩm liên quan)
            ]);

            return response()->json(['message' => 'Tải ảnh bìa thành công!', 'data' => $attachment]);
        }

        return response()->json(['message' => 'Không tìm thấy file'], 400);
    }

    // Cập nhật tệp đính kèm thành ảnh bìa
    public function setCoverImage(Request $request,$cardId, $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);

        if (!in_array(pathinfo($attachment->file_name, PATHINFO_EXTENSION), ['jpg', 'jpeg', 'png', 'gif', 'webp'])) {
            return response()->json([
                'message' => 'Chỉ có thể đặt ảnh làm ảnh bìa!',
                'status' => false,
            ], 422);
        }

        // Xóa ảnh bìa cũ của thẻ
        Attachment::where('card_id', $attachment->card_id)->update(['is_cover' => false]);

        // Đặt ảnh mới làm ảnh bìa
        $attachment->update(['is_cover' => true]);

        return response()->json([
            'message' => 'Cập nhật ảnh bìa thành công!',
            'status' => true,
            'data' => $attachment
        ]);
    }
}
