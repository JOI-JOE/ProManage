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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Log;

class AttachmentController extends Controller
{
    protected $imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'svg'];

    protected function getAuthenticatedUser()
    {
        if (!Auth::check()) {
            throw new \Exception('Bạn cần đăng nhập để thực hiện thao tác này!', 401);
        }
        return Auth::user();
    }

    protected function findCardOrFail($cardId)
    {
        $card = \App\Models\Card::find($cardId);
        if (!$card) {
            throw new \Exception('Card không tồn tại!', 404);
        }
        return $card;
    }

    protected function createActivityLog($user, $card, $event, $properties, $message)
    {
        activity()
            ->causedBy($user)
            ->performedOn($card)
            ->event($event)
            ->withProperties($properties)
            ->log($message);
    }

    public function store(Request $request, $cardId)
    {
        DB::beginTransaction();
        try {
            $user = $this->getAuthenticatedUser();
            $card = $this->findCardOrFail($cardId);
            $userName = $user->full_name ?? 'ai đó';

            $responseData = $this->handleAttachmentCreation($request, $cardId, $card, $user, $userName);
            $message = $request->hasFile('file') ? 'Tệp đính kèm đã được tải lên thành công!' : 'Liên kết đã được thêm thành công!';

            // $card->updated_at = now();
            // $card->save();
            $card->touch(); // Cập nhật updated_at mà không cần gọi save()
            DB::commit();

            // \App\Jobs\BroadcastAttachmentCreated::dispatch($responseData);
            broadcast(new AttachmentCreated($responseData))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return response()->json([
                'success' => true,
                'message' => $message,
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
                'message' => $e->getMessage(),
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    protected function handleAttachmentCreation(Request $request, $cardId, $card, $user, $userName)
    {
        $attachmentId = Str::uuid()->toString();
        $isCover = $request->boolean('is_cover');
        $properties = ['attachment_id' => $attachmentId, 'card_id' => $cardId, 'is_cover' => $isCover];

        if ($request->hasFile('file')) {
            $request->validate([
                'file' => 'required|file|max:20480|mimes:jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,mp4,mov,avi,mkv,mp3,wav,flac,csv,xml,md,py,java,cpp,c,ts,tsx,php,rb,sh,bat,exe,dmg,iso,ai,psd,sketch,fig,webp,bmp,tiff,svg',
                'is_cover' => 'nullable|boolean',
            ], [
                'file.required' => 'Vui lòng chọn một tệp để tải lên!',
                'file.file' => 'Tệp không hợp lệ!',
                'file.max' => 'Tệp không được vượt quá 20MB!',
                'file.mimes' => 'Định dạng tệp không được hỗ trợ! Các định dạng được hỗ trợ: ảnh, video, âm thanh, tài liệu, mã nguồn, v.v.',
            ]);

            $file = $request->file('file');
            $fileName = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('attachments', $fileName, 'public');
            $publicUrl = Storage::url($path);

            if ($isCover && !in_array(strtolower($file->getClientOriginalExtension()), $this->imageExtensions)) {
                throw new \Exception('Chỉ các tệp hình ảnh mới có thể được đặt làm ảnh bìa.');
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

            $properties = array_merge($properties, [
                'file_name_defaut' => $file->getClientOriginalName(),
                'path_url' => $publicUrl,
                'type' => 'file',
            ]);

            $this->createActivityLog(
                $user,
                $card,
                'created_attachment_file',
                $properties,
                "{$userName} đã thêm tệp đính kèm '{$file->getClientOriginalName()}' vào card '{$card->title}'."
            );

            return [
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
        } elseif ($request->input('type') === 'link') {
            $request->validate([
                'file_name_defaut' => 'required|string|max:255',
                'path_url' => 'required|url|max:2048',
                'is_cover' => 'nullable|boolean',
            ], [
                'file_name_defaut.required' => 'Tên liên kết là bắt buộc!',
                'file_name_defaut.max' => 'Tên liên kết không được vượt quá 255 ký tự!',
                'path_url.required' => 'URL liên kết là bắt buộc!',
                'path_url.url' => 'URL không hợp lệ!',
                'path_url.max' => 'URL không được vượt quá 2048 ký tự!',
            ]);

            if ($isCover) {
                throw new \Exception('Liên kết không thể được đặt làm ảnh bìa.');
            }

            $fileNameForLink = Str::slug($request->input('file_name_defaut')) . '_' . Str::random(10);
            DB::table('attachments')->insert([
                'id' => $attachmentId,
                'card_id' => $cardId,
                'path_url' => $request->input('path_url'),
                'file_name_defaut' => $request->input('file_name_defaut'),
                'file_name' => $fileNameForLink,
                'type' => 'link',
                'is_cover' => $isCover,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $properties = array_merge($properties, [
                'file_name_defaut' => $request->input('file_name_defaut'),
                'path_url' => $request->input('path_url'),
                'type' => 'link',
            ]);

            $this->createActivityLog(
                $user,
                $card,
                'created_attachment_link',
                $properties,
                "{$userName} đã thêm liên kết '{$request->input('file_name_defaut')}' vào card '{$card->title}'."
            );

            return [
                'id' => $attachmentId,
                'file_name_defaut' => $request->input('file_name_defaut'),
                'path_url' => $request->input('path_url'),
                'file_name' => $fileNameForLink,
                'card_id' => $cardId,
                'type' => 'link',
                'is_cover' => $isCover,
                'updated_at' => now(),
                'created_at' => now(),
            ];
        }

        throw new \Exception('Không có tệp được tải lên hoặc dữ liệu liên kết không hợp lệ!');
    }

    public function index($cardId)
    {
        try {
            $this->findCardOrFail($cardId);

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
                'message' => $e->getMessage(),
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    public function delete($attachmentId)
    {
        DB::beginTransaction();
        try {
            $user = $this->getAuthenticatedUser();
            $attachment = $this->findAttachmentOrFail($attachmentId);
            $card = $this->findCardOrFail($attachment->card_id);
            $userName = $user->full_name ?? 'ai đó';

            $this->createActivityLog(
                $user,
                $card,
                'deleted_attachment',
                [
                    'attachment_id' => $attachmentId,
                    'file_name_defaut' => $attachment->file_name_defaut,
                    'type' => $attachment->type,
                    'card_id' => $attachment->card_id,
                ],
                "{$userName} đã xóa đính kèm '{$attachment->file_name_defaut}' khỏi card '{$card->title}'."
            );

            if ($attachment->type === 'file' && $attachment->file_name) {
                Log::info('Deleting file from storage', ['file' => $attachment->file_name]);
                Storage::disk('public')->delete('attachments/' . $attachment->file_name);
            }

            if ($attachment->is_cover) {
                Log::info('Removing cover thumbnail');
                $card->thumbnail = null;
            }

            Log::info('Deleting attachment from database');
            DB::table('attachments')->where('id', $attachmentId)->delete();

            $card->touch();
            DB::commit();

            broadcast(new AttachmentDeleted($attachmentId, $card->id))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Đính kèm đã được xóa thành công!',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Attachment deletion failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], $e->getCode() ?: 500);
        }
    }

    public function update(Request $request, string $attachmentId)
    {
        DB::beginTransaction();
        try {
            $user = $this->getAuthenticatedUser();
            $attachment = $this->findAttachmentOrFail($attachmentId);
            $card = $this->findCardOrFail($attachment->card_id);
            $userName = $user->full_name ?? 'ai đó';

            $request->validate([
                'file' => 'nullable|file|max:20480|mimes:jpeg,png,gif,pdf,doc,docx,xls,xlsx,ppt,pptx,txt,mp4,mov,avi,mkv,mp3,wav,flac,csv,xml,md,py,java,cpp,c,ts,tsx,php,rb,sh,bat,exe,dmg,iso,ai,psd,sketch,fig,webp,bmp,tiff,svg',
                'path_url' => 'nullable|url|required_if:type,link',
                'file_name_defaut' => 'nullable|string|max:255',
                'is_cover' => 'nullable|boolean',
                'type' => 'nullable|in:link,file',
            ]);

            $updateData = [];
            $logProperties = ['attachment_id' => $attachmentId, 'card_id' => $attachment->card_id];
            $wasCover = $attachment->is_cover;

            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $fileName = Str::random(20) . '_' . time() . '.' . $file->getClientOriginalExtension();
                $path = $file->storeAs('attachments', $fileName, 'public');
                $publicUrl = Storage::url($path);

                if ($attachment->type === 'file' && $attachment->file_name) {
                    Storage::disk('public')->delete('attachments/' . $attachment->file_name);
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

                if ($wasCover || $request->boolean('is_cover')) {
                    $card->thumbnail = $publicUrl;
                }
            }

            if ($request->filled('path_url') && $request->input('type') === 'link') {
                $updateData['path_url'] = $request->input('path_url');
                $updateData['type'] = 'link';
                $updateData['file_name'] = Str::slug($request->input('file_name_defaut', $attachment->file_name_defaut)) . '_' . Str::random(10);
                $updateData['updated_at'] = now();

                $logProperties['old_path_url'] = $attachment->path_url;
                $logProperties['new_path_url'] = $request->input('path_url');
                $logProperties['old_type'] = $attachment->type;
                $logProperties['new_type'] = 'link';

                if ($wasCover) {
                    $updateData['is_cover'] = false;
                    $card->thumbnail = null;
                }
            }

            if ($request->filled('file_name_defaut')) {
                $updateData['file_name_defaut'] = $request->input('file_name_defaut');
                $logProperties['old_file_name_defaut'] = $attachment->file_name_defaut;
                $logProperties['new_file_name_defaut'] = $request->input('file_name_defaut');
            }

            if ($request->has('is_cover')) {
                $isCover = $request->boolean('is_cover');
                $isImage = false;

                if ($request->hasFile('file')) {
                    $file = $request->file('file');
                    $isImage = in_array(strtolower($file->getClientOriginalExtension()), $this->imageExtensions);
                } else {
                    $extension = strtolower(pathinfo($attachment->file_name ?? $attachment->path_url, PATHINFO_EXTENSION));
                    $isImage = in_array($extension, $this->imageExtensions);
                }

                if ($isCover && (!$isImage || $request->input('type') === 'link')) {
                    throw new \Exception('Chỉ các tệp hình ảnh mới có thể được đặt làm ảnh bìa.');
                }

                $updateData['is_cover'] = $isCover;
                $logProperties['old_is_cover'] = $attachment->is_cover;
                $logProperties['new_is_cover'] = $isCover;

                if ($isCover) {
                    DB::table('attachments')
                        ->where('card_id', $attachment->card_id)
                        ->where('id', '!=', $attachmentId)
                        ->update(['is_cover' => false]);
                    $card->thumbnail = $updateData['path_url'] ?? $attachment->path_url;
                } elseif ($wasCover) {
                    $card->thumbnail = null;
                }
            }

            if (empty($updateData)) {
                throw new \Exception('Không có dữ liệu hợp lệ để cập nhật!');
            }

            DB::table('attachments')->where('id', $attachmentId)->update($updateData);

            $logMessage = "{$userName} đã cập nhật đính kèm '{$attachment->file_name_defaut}' trong card '{$card->title}'.";
            if (isset($updateData['is_cover'])) {
                $logMessage = "{$userName} đã " . ($updateData['is_cover'] ? 'đặt' : 'bỏ') . " đính kèm '{$attachment->file_name_defaut}' làm ảnh bìa trong card '{$card->title}'.";
            }
            $this->createActivityLog($user, $card, 'updated_attachment', $logProperties, $logMessage);

            $card->touch();
            DB::commit();

            $updatedAttachment = $this->findAttachment($attachmentId);

            broadcast(new AttachmentUpdated($updatedAttachment, $card->id))->toOthers();
            broadcast(new CardUpdated($card))->toOthers();

            return response()->json([
                'success' => true,
                'message' => 'Đính kèm đã được cập nhật thành công!',
                'data' => $updatedAttachment,
            ], 200);
        } catch (ModelNotFoundException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Đính kèm không tồn tại!',
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
                'message' => $e->getMessage(),
                'error' => app()->environment('production') ? null : $e->getMessage(),
            ], $e->getCode() ?: 500);
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
            throw new ModelNotFoundException('Đính kèm không tồn tại!');
        }
        return $attachment;
    }
}
