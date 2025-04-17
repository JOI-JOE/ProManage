<?php

namespace App\Http\Controllers\Api;

use App\Events\AttachmentCreated;
use App\Events\AttachmentUpdated;
use App\Events\AttachmentDeleted;
use App\Events\CardUpdated;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AttachmentController extends Controller
{
    public function store(Request $request, $cardId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để thêm attachment!',
            ], 401);
        }

        DB::beginTransaction();
        try {
            $card = \App\Models\Card::find($cardId);
            if (!$card) {
                return response()->json([
                    'success' => false,
                    'message' => 'Card không tồn tại!',
                ], 404);
            }

            $user = Auth::user();
            $userName = $user->full_name ?? 'ai đó';
            $responseData = null;

            if ($request->hasFile('file')) {
                $request->validate([
                    'file' => 'required|file|max:10240|mimes:jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt',
                    'is_cover' => 'nullable|boolean',
                ]);

                $file = $request->file('file');
                $fileName = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('attachments', $fileName, 'public');
                $publicUrl = Storage::url($path);
                $attachmentId = Str::uuid()->toString();

                $isCover = $request->boolean('is_cover');
                if ($isCover && !in_array(strtolower($file->getClientOriginalExtension()), ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'])) {
                    throw new \Exception('Only image files can be set as cover.');
                }

                DB::table('attachments')->insert([
                    'id' => $attachmentId,
                    'card_id' => $cardId,
                    'path_url' => $publicUrl,
                    'file_name_defaut' => $file->getClientOriginalName(),
                    'file_name' => $fileName,
                    'type' => 'file',
                    'is_cover' => $isCover,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]);

                if ($isCover) {
                    DB::table('attachments')
                        ->where('card_id', $cardId)
                        ->where('id', '!=', $attachmentId)
                        ->update(['is_cover' => false]);
                    $card->thumbnail = $publicUrl;
                    $card->save();
                }

                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event('created_attachment_file')
                    ->withProperties([
                        'attachment_id' => $attachmentId,
                        'file_name_defaut' => $file->getClientOriginalName(),
                        'path_url' => $publicUrl,
                        'type' => 'file',
                        'is_cover' => $isCover,
                        'card_id' => $cardId,
                    ])
                    ->log("{$userName} đã thêm tệp đính kèm '{$file->getClientOriginalName()}' vào card '{$card->title}'.");

                $responseData = [
                    'id' => $attachmentId,
                    'file_name_defaut' => $file->getClientOriginalName(),
                    'path_url' => $publicUrl,
                    'file_name' => $fileName,
                    'card_id' => $cardId,
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType(),
                    'type' => 'file',
                    'is_cover' => $isCover,
                    'updated_at' => now(),
                    'created_at' => now(),
                ];
                $message = 'Attachment uploaded successfully';
            } elseif ($request->input('type') === 'link') {
                $request->validate([
                    'file_name_defaut' => 'required|string|max:255',
                    'path_url' => 'required|url|max:2048',
                    'is_cover' => 'nullable|boolean',
                ]);

                $fileNameForLink = Str::slug($request->input('file_name_defaut')) . '_' . Str::random(10);
                $attachmentId = Str::uuid()->toString();
                $isCover = $request->boolean('is_cover');

                if ($isCover) {
                    throw new \Exception('Links cannot be set as cover.');
                }

                DB::table('attachments')->insert([
                    'id' => $attachmentId,
                    'card_id' => $cardId,
                    'path_url' => $request->input('path_url'),
                    'file_name_defaut' => $request->input('file_name_defaut'),
                    'file_name' => $fileNameForLink,
                    'type' => 'link',
                    'is_cover' => false, // Links can't be covers as per your validation
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event('created_attachment_link')
                    ->withProperties([
                        'attachment_id' => $attachmentId,
                        'file_name_defaut' => $request->input('file_name_defaut'),
                        'path_url' => $request->input('path_url'),
                        'type' => 'link',
                        'is_cover' => false,
                        'card_id' => $cardId,
                    ])
                    ->log("{$userName} đã thêm liên kết '{$request->input('file_name_defaut')}' vào card '{$card->title}'.");

                // Define responseData for links too
                $responseData = [
                    'id' => $attachmentId,
                    'file_name_defaut' => $request->input('file_name_defaut'),
                    'path_url' => $request->input('path_url'),
                    'file_name' => $fileNameForLink,
                    'card_id' => $cardId,
                    'type' => 'link',
                    'is_cover' => false,
                    'updated_at' => now(),
                    'created_at' => now(),
                ];
                $message = 'Link added successfully';
            } else {
                throw new \Exception('No file uploaded or invalid link data provided');
            }

            DB::commit();

            $card->updated_at = now();
            $card->save();

            try {
                broadcast(new AttachmentCreated($responseData))->toOthers();
                event(new CardUpdated($card));
            } catch (\Exception $e) {
                Log::error("Failed to broadcast events: {$e->getMessage()}", [
                    'card_id' => $cardId,
                    'attachment_id' => $attachmentId ?? null,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => $message ?? 'Attachment added successfully',
                'data' => $responseData,
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add attachment',
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], 500);
        }
    }

    public function index($cardId)
    {
        try {
            $card = \App\Models\Card::find($cardId);
            if (!$card) {
                return response()->json([
                    'success' => false,
                    'message' => 'Card không tồn tại!',
                ], 404);
            }

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
                    'updated_at',
                ])
                ->get();

            return response()->json([
                'success' => true,
                'data' => $attachments,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error retrieving attachments',
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], 500);
        }
    }

    public function delete($attachmentId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để xóa attachment!',
            ], 401);
        }

        DB::beginTransaction();
        try {
            $attachment = DB::table('attachments')->where('id', $attachmentId)->first();
            if (!$attachment) {
                return response()->json([
                    'success' => false,
                    'message' => 'Attachment not found',
                ], 404);
            }

            $card = \App\Models\Card::find($attachment->card_id);
            if (!$card) {
                return response()->json([
                    'success' => false,
                    'message' => 'Card không tồn tại!',
                ], 404);
            }

            $user = Auth::user();
            $userName = $user->full_name ?? 'ai đó';

            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('deleted_attachment')
                ->withProperties([
                    'attachment_id' => $attachmentId,
                    'file_name_defaut' => $attachment->file_name_defaut,
                    'type' => $attachment->type,
                    'card_id' => $attachment->card_id,
                ])
                ->log("{$userName} đã xóa đính kèm '{$attachment->file_name_defaut}' khỏi card '{$card->title}'.");

            if ($attachment->type === 'file' && $attachment->file_name) {
                $filePath = 'attachments/' . $attachment->file_name;
                if (Storage::disk('public')->exists($filePath)) {
                    Storage::disk('public')->delete($filePath);
                }
            }

            if ($attachment->is_cover) {
                $card->thumbnail = null;
            }

            DB::table('attachments')->where('id', $attachmentId)->delete();
            $card->updated_at = now();
            $card->save();

            DB::commit();

            // Trigger real-time events
            try {
                broadcast(new AttachmentDeleted($attachmentId, $card))->toOthers();
                event(new CardUpdated($card));
            } catch (\Exception $e) {
                Log::error("Failed to broadcast events: {$e->getMessage()}", [
                    'card_id' => $card->id,
                    'attachment_id' => $attachmentId,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachment deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Error deleting attachment',
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], 500);
        }
    }

    public function update(Request $request, string $attachmentId)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => 'Bạn cần đăng nhập để cập nhật attachment!',
            ], 401);
        }

        DB::beginTransaction();
        try {
            $attachment = $this->findAttachmentOrFail($attachmentId);
            $card = \App\Models\Card::find($attachment->card_id);
            if (!$card) {
                throw new \Exception('Card không tồn tại!');
            }

            $user = Auth::user();
            $userName = $user->full_name ?? 'ai đó';

            $request->validate([
                'file' => 'nullable|file|max:10240|mimes:jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt',
                'path_url' => 'nullable|url|required_if:type,link',
                'file_name_defaut' => 'nullable|string|max:255',
                'is_cover' => 'nullable|boolean',
                'type' => 'nullable|in:link,file',
            ]);

            $updateData = [];
            $logProperties = ['attachment_id' => $attachmentId, 'card_id' => $attachment->card_id];
            $wasCover = $attachment->is_cover;

            // Handle file upload
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('attachments', $fileName, 'public');
                $publicUrl = Storage::url($path);

                // Delete old file if it exists
                if ($attachment->type === 'file' && $attachment->file_name) {
                    $oldFilePath = 'attachments/' . $attachment->file_name;
                    if (Storage::disk('public')->exists($oldFilePath)) {
                        Storage::disk('public')->delete($oldFilePath);
                    }
                }

                $updateData = [
                    'path_url' => $publicUrl,
                    'file_name_defaut' => $file->getClientOriginalName(),
                    'file_name' => $fileName,
                    'type' => 'file',
                    'updated_at' => now(),
                ];

                $logProperties['old_file_name_defaut'] = $attachment->file_name_defaut;
                $logProperties['new_file_name_defaut'] = $file->getClientOriginalName();
                $logProperties['old_path_url'] = $attachment->path_url;
                $logProperties['new_path_url'] = $publicUrl;

                // Update card thumbnail if this was the cover
                if ($wasCover || $request->boolean('is_cover')) {
                    $card->thumbnail = $publicUrl;
                }
            }

            // Handle link update
            if ($request->filled('path_url') && $request->input('type') === 'link') {
                $updateData['path_url'] = $request->input('path_url');
                $updateData['type'] = 'link';
                $updateData['file_name'] = Str::slug($request->input('file_name_defaut', $attachment->file_name_defaut)) . '_' . Str::random(10);
                $updateData['updated_at'] = now();

                $logProperties['old_path_url'] = $attachment->path_url;
                $logProperties['new_path_url'] = $request->input('path_url');
                $logProperties['old_type'] = $attachment->type;
                $logProperties['new_type'] = 'link';

                // If this was a cover, it can no longer be as links can't be covers
                if ($wasCover) {
                    $updateData['is_cover'] = false;
                    $card->thumbnail = null;
                }
            }

            // Handle file name update
            if ($request->filled('file_name_defaut')) {
                $updateData['file_name_defaut'] = $request->input('file_name_defaut');
                $logProperties['old_file_name_defaut'] = $attachment->file_name_defaut;
                $logProperties['new_file_name_defaut'] = $request->input('file_name_defaut');
            }

            // Handle cover flag update
            if ($request->has('is_cover')) {
                $isCover = $request->boolean('is_cover');
                $allowedImageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
                $isImage = false;

                if ($request->hasFile('file')) {
                    $file = $request->file('file');
                    $isImage = in_array(strtolower($file->getClientOriginalExtension()), $allowedImageExtensions);
                } else {
                    $extension = strtolower(pathinfo($attachment->file_name, PATHINFO_EXTENSION));
                    $isImage = in_array($extension, $allowedImageExtensions);
                }

                if ($isCover && (!$isImage || $request->input('type') === 'link')) {
                    throw new \Exception('Only image files can be set as cover.');
                }

                $updateData['is_cover'] = $isCover;
                $logProperties['old_is_cover'] = $attachment->is_cover;
                $logProperties['new_is_cover'] = $isCover;

                if ($isCover) {
                    // Remove is_cover flag from all other attachments
                    DB::table('attachments')
                        ->where('card_id', $attachment->card_id)
                        ->where('id', '!=', $attachmentId)
                        ->update(['is_cover' => false]);

                    // Set thumbnail to the current attachment path
                    $card->thumbnail = $updateData['path_url'] ?? $attachment->path_url;
                } elseif ($wasCover) {
                    // If this was a cover but no longer is, remove thumbnail
                    $card->thumbnail = null;
                }
            }

            if (empty($updateData)) {
                throw new \Exception('No valid data provided for update');
            }

            // Update the attachment
            DB::table('attachments')->where('id', $attachmentId)->update($updateData);

            // Create activity log
            if (!empty($logProperties)) {
                $logMessage = "{$userName} đã cập nhật đính kèm '{$attachment->file_name_defaut}' trong card '{$card->title}'.";
                if (isset($updateData['is_cover'])) {
                    $logMessage = "{$userName} đã " . ($updateData['is_cover'] ? 'đặt' : 'bỏ') . " đính kèm '{$attachment->file_name_defaut}' làm ảnh bìa trong card '{$card->title}'.";
                }
                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event('updated_attachment')
                    ->withProperties($logProperties)
                    ->log($logMessage);
            }

            // Always update card's timestamp and save any thumbnail changes
            $card->updated_at = now();
            $card->save();

            DB::commit();

            $updatedAttachment = $this->findAttachment($attachmentId);
            try {
                broadcast(new AttachmentUpdated($updatedAttachment, $card))->toOthers();
                event(new CardUpdated($card));
            } catch (\Exception $e) {
                Log::error("Failed to broadcast events: {$e->getMessage()}", [
                    'card_id' => $card->id,
                    'attachment_id' => $attachmentId,
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Attachment updated successfully',
                'data' => $updatedAttachment,
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found',
                'id' => $attachmentId,
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Dữ liệu không hợp lệ!',
                'errors' => $e->errors(),
            ], 422);
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
            ->select([
                'id',
                'card_id',
                'path_url',
                'file_name_defaut',
                'file_name',
                'type',
                'is_cover',
                'created_at',
                'updated_at',
            ])
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
}
