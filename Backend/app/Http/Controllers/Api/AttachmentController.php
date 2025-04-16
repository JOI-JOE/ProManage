<?php

namespace App\Http\Controllers\Api;

use App\Events\AttachmentDeletedWithActivity;
use App\Events\AttachmentUploaded;
use App\Events\CoverImageUpdated;
use App\Events\FileNameUpdated;
use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Card;
use App\Notifications\AttachmentUploadedNotification;
use App\Notifications\CardNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Str;

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
        Log::info('📥 Dữ liệu nhận từ frontend:', $request->all());

        // Validate dữ liệu nhận từ frontend
        $request->validate([
            'file' => 'nullable|file', // Giới hạn 10MB
            'path_url' => 'nullable|url', // Kiểm tra định dạng URL hợp lệ
            'file_name_defaut' => 'nullable|string', // Tên hiển thị của link
        ]);

        if ($request->hasFile('file')) {
            // Xử lý khi tải file lên
            $file = $request->file('file');
            $fileNameDefaut = $file->getClientOriginalName();
            $fileName = time() . '_' . $fileNameDefaut;
            $path = $file->storeAs('attachments', $fileName, 'public');

            $attachment = Attachment::create([
                'path_url' => asset("storage/{$path}"),
                'file_name_defaut' => $fileNameDefaut,
                'file_name' => $fileName,
                'is_cover' => false,
                'card_id' => $cardId,
            ]);
        } elseif ($request->has('path_url')) {
            // Xử lý khi lưu link
            $fileNameDefaut = $request->file_name_defaut ?? parse_url($request->path_url, PHP_URL_HOST);
            $attachment = Attachment::create([
                'path_url' => $request->path_url,
                'file_name_defaut' => $fileNameDefaut,
                'file_name' => $fileNameDefaut,
                'is_cover' => false,
                'card_id' => $cardId,
            ]);
        } else {
            return response()->json(['message' => 'Vui lòng cung cấp file hoặc link hợp lệ'], 400);
        }

        // Ghi log hoạt động
        $user_name = auth()->user()?->full_name ?? 'ai đó';

        $card = Card::findOrFail($cardId);
        activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('uploaded_attachment')
            ->withProperties([
                'file_name' => $attachment->file_name_defaut,
                'file_path' => $attachment->path_url,
            ])
            ->log("{$user_name} đã đính kèm tập tin {$attachment->file_name_defaut} vào thẻ này");

        $activity = Activity::where('subject_type', Card::class)
            ->where('subject_id', $cardId)
            ->latest()
            ->first();

        broadcast(new AttachmentUploaded($attachment, $activity, $user_name));


        // Gửi thông báo
        $users = $card->users()->where('id', '!=', auth()->id())->get();
        foreach ($users as $user) {
            $user->notify(new AttachmentUploadedNotification($card, $attachment, $user_name));
        }

        return response()->json([
            'message' => 'Đính kèm đã được tải lên thành công!',
            'status' => true,
            'data' => $attachment,
        ]);
    }


    // Xóa file đính kèm
    public function deleteAttachment($cardId, $attachmentId)
    {
        $attachment = Attachment::findOrFail($attachmentId);
        $fileNameDefault = $attachment->file_name_defaut; // Lấy tên file gốc

        Storage::disk('public')->delete($attachment->path_url);

        $attachment->delete();
        $user_name = auth()->user()?->full_name ?? 'ai đó';

        $card = Card::findOrFail($cardId);
        $activity = activity()
            ->causedBy(auth()->user())
            ->performedOn($card)
            ->event('deleted_attachment')
            ->withProperties([
                'card_id' => $cardId,
                'attachment_id' => $attachmentId,
                'file_name' => $fileNameDefault,
            ])
            ->log("{$user_name} đã xoá tập tin đính kèm {$fileNameDefault} khỏi thẻ này ");


        broadcast(new AttachmentDeletedWithActivity($cardId, $attachmentId, $fileNameDefault, $activity))->toOthers();
        return response()->json([
            'message' => 'Xóa tệp đính kèm thành công!',
            'status' => true,
        ]);
    }
    // tải ảnh bìa lên
    public function uploadCover(Request $request, $cardId)
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
    public function setCoverImage($cardId, $attachmentId)
    {
        try {
            // Tìm attachment và kiểm tra nó thuộc card
            $attachment = Attachment::where('id', $attachmentId)
                ->where('card_id', $cardId)
                ->firstOrFail();

            // // Kiểm tra định dạng file
            // $extension = strtolower(pathinfo($attachment->file_name, PATHINFO_EXTENSION));
            // $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            // if (!in_array($extension, $allowedExtensions)) {
            //     return response()->json([
            //         'message' => 'Chỉ có thể đặt ảnh làm ảnh bìa!',
            //         'status' => false,
            //     ], 422);
            // }

            // Đảm bảo chỉ có 1 ảnh bìa duy nhất hoặc bỏ ảnh bìa nếu đã chọn
            DB::transaction(function () use ($cardId, $attachment) {
                if ($attachment->is_cover) {
                    // Nếu attachment đang là ảnh bìa, bỏ trạng thái ảnh bìa
                    $attachment->update(['is_cover' => false]);
                } else {
                    // Xóa ảnh bìa cũ: đặt tất cả is_cover về false
                    Attachment::where('card_id', $cardId)
                        ->update(['is_cover' => false]);

                    // Đặt attachment mới làm ảnh bìa
                    $attachment->update(['is_cover' => true]);
                }
            });

            broadcast(new CoverImageUpdated($attachment->fresh()))->toOthers();

            return response()->json([
                'message' => $attachment->is_cover ? 'Cập nhật ảnh bìa thành công!' : 'Đã bỏ ảnh bìa!',
                'status' => true,
                'data' => $attachment->fresh(),
            ], 200);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'message' => 'Không tìm thấy tệp đính kèm!',
                'status' => false,
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Có lỗi xảy ra khi cập nhật ảnh bìa!',
                'status' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    public function updateNameFileAttachment(Request $request, $cardId, $attachmentId)
    {
        try {
            // Ghi log để kiểm tra dữ liệu nhận được
            Log::info('Request update file name:', ['cardId' => $cardId, 'attachmentId' => $attachmentId, 'data' => $request->all()]);

            // Kiểm tra đầu vào hợp lệ
            $validatedData = $request->validate([
                'file_name_defaut' => 'required|string|max:255',
            ]);

            // Tìm attachment theo ID và kiểm tra có thuộc card không
            $attachment = Attachment::where('id', $attachmentId)
                ->where('card_id', $cardId)
                ->first();

            if (!$attachment) {
                return response()->json(['error' => 'Tệp đính kèm không tồn tại hoặc không thuộc thẻ này'], 404);
            }

            // Cập nhật tên file
            $attachment->file_name_defaut = $validatedData['file_name_defaut'];
            $attachment->save();

            broadcast(new FileNameUpdated($attachment))->toOthers();

            return response()->json([
                'message' => 'Cập nhật tên tệp thành công',
                'attachment' => $attachment
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['error' => 'Dữ liệu không hợp lệ', 'messages' => $e->errors()], 400);
        } catch (\Exception $e) {
            Log::error('Lỗi khi cập nhật tên file:', ['error' => $e->getMessage()]);
            return response()->json(['error' => 'Lỗi khi cập nhật tên tệp'], 500);
        }
    }

}
