<?php

namespace App\Http\Controllers\Api;

use App\Events\AttachmentDeletedWithActivity;
use App\Events\AttachmentUploaded;
use App\Http\Controllers\Controller;
use App\Models\Attachment;
use App\Models\Card;
use App\Notifications\AttachmentUploadedNotification;
use App\Notifications\CardNotification;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    // 
    public function store(Request $request, $cardId)
    {
        DB::beginTransaction();
        try {
            if ($request->hasFile('file')) {
                // Validate file upload
                $request->validate([
                    'file' => 'required|file|max:10240|mimes:jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt', // Max 10MB, allowed mimes
                    'is_cover' => 'nullable|boolean',
                ]);

                // Upload file
                $file = $request->file('file');
                $fileName = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('public/attachments', $fileName);
                $publicUrl = Storage::url($path);
                $attachmentId = Str::uuid();

                DB::table('attachments')->insert([
                    'id' => $attachmentId,
                    'card_id' => $cardId,
                    'path_url' => $publicUrl,
                    'file_name_defaut' => $file->getClientOriginalName(),
                    'file_name' => $fileName,
                    'type' => 'file',
                    'is_cover' => $request->input('is_cover', 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $responseData = [
                    'id' => $attachmentId,
                    'file_name_defaut' => $file->getClientOriginalName(),
                    'path_url' => $publicUrl,
                    'file_name' => $fileName,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'type' => 'file',
                    'is_cover' => $request->input('is_cover', 0),
                ];
                $success = true;
                $message = 'Attachment uploaded successfully';
            } elseif ($request->input('type') === 'link') {
                // Validate link data
                $validated = $request->validate([
                    'file_name_defaut' => 'required|string|max:255',
                    'path_url' => 'required|url|max:2048',
                    'is_cover' => 'nullable|boolean',
                ]);

                // Generate a unique file_name for the link
                $fileNameForLink = Str::slug($validated['file_name_defaut']) . '_' . Str::random(10);

                // Save link
                $attachmentId = Str::uuid();
                DB::table('attachments')->insert([
                    'id' => $attachmentId,
                    'card_id' => $cardId,
                    'path_url' => $validated['path_url'],
                    'file_name_defaut' => $validated['file_name_defaut'],
                    'file_name' => $fileNameForLink, // Generate a unique file_name for the link
                    'type' => 'link',
                    'is_cover' => $request->input('is_cover', 0),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $responseData = [
                    'id' => $attachmentId,
                    'file_name_defaut' => $validated['file_name_defaut'],
                    'path_url' => $validated['path_url'],
                    'file_name' => $fileNameForLink,
                    'type' => 'link',
                    'is_cover' => $request->input('is_cover', 0),
                ];
                $success = true;
                $message = 'Link attached successfully';
            } else {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'No file uploaded or invalid link data provided',
                ], 400);
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => $message,
                'data' => $responseData,
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add attachment',
                'error' => $e->getMessage(), // Optionally include the error message for debugging
            ], 500);
        }
    }
    public function index($cardId)
    {
        try {
            $attachments = DB::table('attachments')
                ->where('card_id', $cardId)
                ->select([
                    'id',
                    'card_id',
                    'path_url',
                    'file_name_defaut',
                    'type',
                    'file_name',
                    'is_cover',
                    'created_at',
                    'updated_at'
                ])
                ->get();

            return response()->json([
                'data' => $attachments
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error retrieving attachments',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function delete($attachmentId)
    {
        try {
            // Tìm attachment theo ID
            $attachment = DB::table('attachments')->where('id', $attachmentId)->first();

            if (!$attachment) {
                return response()->json([
                    'message' => 'Attachment not found'
                ], 404);
            }

            DB::beginTransaction();

            // Nếu là file upload, xử lý xoá file vật lý
            if ($attachment->type === 'file' && !empty($attachment->file_name)) {
                $filePath = storage_path('app/public/attachments/' . $attachment->file_name);

                if (file_exists($filePath)) {
                    @unlink($filePath); // Xoá file vật lý
                }
            }

            // Nếu attachment này đang là cover, xoá thumbnail của card
            if ($attachment->is_cover) {
                DB::table('cards')
                    ->where('id', $attachment->card_id)
                    ->update(['thumbnail' => null]);
            }

            // Xoá bản ghi attachment
            DB::table('attachments')->where('id', $attachmentId)->delete();

            DB::commit();

            return response()->json([
                'message' => 'Attachment deleted successfully'
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();

            return response()->json([
                'message' => 'Error deleting attachment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, string $attachmentId)
    {
        DB::beginTransaction();

        try {
            // Find attachment using raw query
            $attachment = $this->findAttachmentOrFail($attachmentId);

            // Validate request data
            $validator = Validator::make($request->all(), [
                'file' => 'nullable|file|max:10240', // Max 10MB, adjust as needed
                'path_url' => 'nullable|url|required_if:type,link',
                'file_name_defaut' => 'nullable|string|max:255',
                'is_cover' => 'nullable|boolean',
                'type' => 'nullable|in:link,file',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors(),
                ], 422);
            }

            $updateData = $this->prepareUpdateData($request, $attachment);
            if (empty($updateData)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No valid data provided for update',
                ], 422);
            }

            // Update attachment using raw query
            DB::table('attachments')
                ->where('id', $attachmentId)
                ->update($updateData);

            DB::commit();

            // Fetch updated attachment
            $updatedAttachment = $this->findAttachment($attachmentId);

            return response()->json([
                'success' => true,
                'message' => 'Attachment updated successfully',
                'data' => $updatedAttachment,
            ]);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found',
                'id' => $attachmentId,
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to update attachment',
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], 500);
        }
    }
    private function findAttachment(string $id): ?object
    {
        return DB::table('attachments')
            ->select('id', 'card_id', 'path_url', 'file_name_defaut', 'file_name', 'type', 'is_cover', 'created_at', 'updated_at')
            ->where('id', $id)
            ->first();
    }

    private function findAttachmentOrFail(string $id): object
    {
        $attachment = $this->findAttachment($id);

        if (!$attachment) {
            throw new ModelNotFoundException('Attachment not found');
        }

        return $attachment;
    }
    private function prepareUpdateData(Request $request, object $attachment): array
    {
        $updateData = [];

        // Handle file upload
        if ($request->hasFile('file')) {
            $updateData = $this->handleFileUploadUpdate($request, $attachment);
        }

        // Handle link update
        if ($request->filled('path_url') && $request->input('type') === 'link') {
            $updateData['path_url'] = $request->input('path_url');
            $updateData['type'] = 'link';
        }

        // Update file_name_defaut if provided
        if ($request->filled('file_name_defaut')) {
            $updateData['file_name_defaut'] = $request->input('file_name_defaut');
        }

        // Handle is_cover and update card thumbnail
        if ($request->filled('is_cover')) {
            $isCover = $request->boolean('is_cover');

            // Allowed image extensions
            $allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];

            // Check if the attachment is an image
            $isImage = false;
            if ($request->hasFile('file')) {
                // If a new file is uploaded, check its MIME type and extension
                $file = $request->file('file');
                $isImage = in_array(strtolower($file->getClientOriginalExtension()), $allowedImageExtensions) ||
                    str_starts_with($file->getMimeType(), 'image/');
            } else {
                // If no new file, check the existing file_name extension
                $extension = strtolower(pathinfo($attachment->file_name, PATHINFO_EXTENSION));
                $isImage = in_array($extension, $allowedImageExtensions);
            }

            // Only allow is_cover = true for image files
            if ($isCover && !$isImage) {
                throw new \Exception('Only image files can be set as cover.');
            }

            // Proceed with updating is_cover and thumbnail
            DB::transaction(function () use ($isCover, $attachment, &$updateData) {
                $updateData['is_cover'] = $isCover;

                if ($isCover) {
                    DB::table('attachments')
                        ->where('card_id', $attachment->card_id)
                        ->where('id', '!=', $attachment->id)
                        ->update(['is_cover' => false]);
                    DB::table('cards')
                        ->where('id', $attachment->card_id)
                        ->update(['thumbnail' => $attachment->path_url]);
                } else {
                    // If removing cover, check if this was the cover
                    if ($attachment->is_cover) {
                        // Clear the card's thumbnail since no attachment is cover
                        DB::table('cards')
                            ->where('id', $attachment->card_id)
                            ->update(['thumbnail' => null]);
                    }
                }
            });
        }
        // Set updated_at
        $updateData['updated_at'] = now();

        return array_filter($updateData, fn($value) => !is_null($value));
    }
    private function handleFileUploadUpdate(Request $request, object $attachment): array
    {
        $file = $request->file('file');
        $fileName = $file->getClientOriginalName();
        $uniqueFileName = uniqid() . '_' . $fileName;
        $path = $file->storeAs('attachments', $uniqueFileName, 'public');

        // Delete old file if it exists
        if ($attachment->path_url && Storage::disk('public')->exists($attachment->path_url)) {
            Storage::disk('public')->delete($attachment->path_url);
        }

        return [
            'path_url' => $path,
            'file_name_defaut' => $fileName,
            'file_name' => $uniqueFileName,
            'type' => 'file',
        ];
    }


    // ------------------------------------------------------------------------------------
    // Lấy danh sách file đính kèm của một thẻ
    // public function getAttachments($cardId)
    // {
    //     $attachments = Attachment::where('card_id', $cardId)->get();

    //     return response()->json([
    //         'message' => 'Lấy danh sách tệp đính kèm thành công!',
    //         'status' => true,
    //         'data' => $attachments
    //     ]);
    // }

    // // Upload file đính kèm
    // public function uploadAttachment(Request $request, $cardId)
    // {
    //     Log::info('📥 Dữ liệu nhận từ frontend:', $request->all());

    //     // Validate dữ liệu nhận từ frontend
    //     $request->validate([
    //         'file' => 'nullable|file', // Giới hạn 10MB
    //         'path_url' => 'nullable|url', // Kiểm tra định dạng URL hợp lệ
    //         'file_name_defaut' => 'nullable|string', // Tên hiển thị của link
    //     ]);

    //     if ($request->hasFile('file')) {
    //         // Xử lý khi tải file lên
    //         $file = $request->file('file');
    //         $fileNameDefaut = $file->getClientOriginalName();
    //         $fileName = time() . '_' . $fileNameDefaut;
    //         $path = $file->storeAs('attachments', $fileName, 'public');

    //         $attachment = Attachment::create([
    //             'path_url' => asset("storage/{$path}"),
    //             'file_name_defaut' => $fileNameDefaut,
    //             'file_name' => $fileName,
    //             'is_cover' => false,
    //             'card_id' => $cardId,
    //         ]);
    //     } elseif ($request->has('path_url')) {
    //         // Xử lý khi lưu link
    //         $fileNameDefaut = $request->file_name_defaut ?? parse_url($request->path_url, PHP_URL_HOST);
    //         $attachment = Attachment::create([
    //             'path_url' => $request->path_url,
    //             'file_name_defaut' => $fileNameDefaut,
    //             'file_name' => $fileNameDefaut,
    //             'is_cover' => false,
    //             'card_id' => $cardId,
    //         ]);
    //     } else {
    //         return response()->json(['message' => 'Vui lòng cung cấp file hoặc link hợp lệ'], 400);
    //     }

    //     // Ghi log hoạt động
    //     $user_name = auth()->user()?->full_name ?? 'ai đó';

    //     $card = Card::findOrFail($cardId);
    //     activity()
    //         ->causedBy(auth()->user())
    //         ->performedOn($card)
    //         ->event('uploaded_attachment')
    //         ->withProperties([
    //             'file_name' => $attachment->file_name_defaut,
    //             'file_path' => $attachment->path_url,
    //         ])
    //         ->log("{$user_name} đã đính kèm tập tin {$attachment->file_name_defaut} vào thẻ này");

    //     $activity = Activity::where('subject_type', Card::class)
    //         ->where('subject_id', $cardId)
    //         ->latest()
    //         ->first();

    //     broadcast(new AttachmentUploaded($attachment, $activity, $user_name));


    //     // Gửi thông báo
    //     $users = $card->users()->where('id', '!=', auth()->id())->get();
    //     foreach ($users as $user) {
    //         $user->notify(new AttachmentUploadedNotification($card, $attachment, $user_name));
    //     }

    //     return response()->json([
    //         'message' => 'Đính kèm đã được tải lên thành công!',
    //         'status' => true,
    //         'data' => $attachment,
    //     ]);
    // }
    // // Xóa file đính kèm
    // public function deleteAttachment($cardId, $attachmentId)
    // {
    //     $attachment = Attachment::findOrFail($attachmentId);
    //     $fileNameDefault = $attachment->file_name_defaut; // Lấy tên file gốc

    //     Storage::disk('public')->delete($attachment->path_url);

    //     $attachment->delete();
    //     $user_name = auth()->user()?->full_name ?? 'ai đó';

    //     $card = Card::findOrFail($cardId);
    //     $activity = activity()
    //         ->causedBy(auth()->user())
    //         ->performedOn($card)
    //         ->event('deleted_attachment')
    //         ->withProperties([
    //             'card_id' => $cardId,
    //             'attachment_id' => $attachmentId,
    //             'file_name' => $fileNameDefault,
    //         ])
    //         ->log("{$user_name} đã xoá tập tin đính kèm {$fileNameDefault} khỏi thẻ này ");


    //     broadcast(new AttachmentDeletedWithActivity($cardId, $attachmentId, $fileNameDefault, $activity))->toOthers();
    //     return response()->json([
    //         'message' => 'Xóa tệp đính kèm thành công!',
    //         'status' => true,
    //     ]);
    // }
    // // tải ảnh bìa lên
    // public function uploadCover(Request $request, $cardId)
    // {
    //     $request->validate([
    //         'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
    //     ]);

    //     if ($request->hasFile('image')) {
    //         $file = $request->file('image');
    //         $fileNameDefault = $file->getClientOriginalName();
    //         $fileName = time() . '_' . $fileNameDefault;

    //         // Lưu ảnh vào thư mục public/uploads
    //         $filePath = $file->store('attachments', 'public');
    //         Attachment::where('card_id', $cardId)->where('is_cover', true)->update(['is_cover' => false]);

    //         // Lưu vào database
    //         $attachment = Attachment::create([
    //             'path_url' => $filePath,
    //             'file_name_defaut' => $fileNameDefault,
    //             'file_name' => $fileName,
    //             'is_cover' => true,
    //             'card_id' => $cardId, // ID của card (hoặc sản phẩm liên quan)
    //         ]);

    //         return response()->json(['message' => 'Tải ảnh bìa thành công!', 'data' => $attachment]);
    //     }

    //     return response()->json(['message' => 'Không tìm thấy file'], 400);
    // }

    // // Cập nhật tệp đính kèm thành ảnh bìa
    // public function setCoverImage($cardId, $attachmentId)
    // {
    //     try {
    //         // Tìm attachment và kiểm tra nó thuộc card
    //         $attachment = Attachment::where('id', $attachmentId)
    //             ->where('card_id', $cardId)
    //             ->firstOrFail();

    //         // // Kiểm tra định dạng file
    //         // $extension = strtolower(pathinfo($attachment->file_name, PATHINFO_EXTENSION));
    //         // $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    //         // if (!in_array($extension, $allowedExtensions)) {
    //         //     return response()->json([
    //         //         'message' => 'Chỉ có thể đặt ảnh làm ảnh bìa!',
    //         //         'status' => false,
    //         //     ], 422);
    //         // }

    //         // Đảm bảo chỉ có 1 ảnh bìa duy nhất hoặc bỏ ảnh bìa nếu đã chọn
    //         DB::transaction(function () use ($cardId, $attachment) {
    //             if ($attachment->is_cover) {
    //                 // Nếu attachment đang là ảnh bìa, bỏ trạng thái ảnh bìa
    //                 $attachment->update(['is_cover' => false]);
    //             } else {
    //                 // Xóa ảnh bìa cũ: đặt tất cả is_cover về false
    //                 Attachment::where('card_id', $cardId)
    //                     ->update(['is_cover' => false]);

    //                 // Đặt attachment mới làm ảnh bìa
    //                 $attachment->update(['is_cover' => true]);
    //             }
    //         });

    //         return response()->json([
    //             'message' => $attachment->is_cover ? 'Cập nhật ảnh bìa thành công!' : 'Đã bỏ ảnh bìa!',
    //             'status' => true,
    //             'data' => $attachment->fresh(),
    //         ], 200);
    //     } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
    //         return response()->json([
    //             'message' => 'Không tìm thấy tệp đính kèm!',
    //             'status' => false,
    //         ], 404);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'message' => 'Có lỗi xảy ra khi cập nhật ảnh bìa!',
    //             'status' => false,
    //             'error' => $e->getMessage(),
    //         ], 500);
    //     }
    // }
    // public function updateNameFileAttachment(Request $request, $cardId, $attachmentId)
    // {
    //     try {
    //         // Ghi log để kiểm tra dữ liệu nhận được
    //         Log::info('Request update file name:', ['cardId' => $cardId, 'attachmentId' => $attachmentId, 'data' => $request->all()]);

    //         // Kiểm tra đầu vào hợp lệ
    //         $validatedData = $request->validate([
    //             'file_name_defaut' => 'required|string|max:255',
    //         ]);

    //         // Tìm attachment theo ID và kiểm tra có thuộc card không
    //         $attachment = Attachment::where('id', $attachmentId)
    //             ->where('card_id', $cardId)
    //             ->first();

    //         if (!$attachment) {
    //             return response()->json(['error' => 'Tệp đính kèm không tồn tại hoặc không thuộc thẻ này'], 404);
    //         }

    //         // Cập nhật tên file
    //         $attachment->file_name_defaut = $validatedData['file_name_defaut'];
    //         $attachment->save();

    //         return response()->json([
    //             'message' => 'Cập nhật tên tệp thành công',
    //             'attachment' => $attachment
    //         ], 200);
    //     } catch (\Illuminate\Validation\ValidationException $e) {
    //         return response()->json(['error' => 'Dữ liệu không hợp lệ', 'messages' => $e->errors()], 400);
    //     } catch (\Exception $e) {
    //         Log::error('Lỗi khi cập nhật tên file:', ['error' => $e->getMessage()]);
    //         return response()->json(['error' => 'Lỗi khi cập nhật tên tệp'], 500);
    //     }
    // }

}
