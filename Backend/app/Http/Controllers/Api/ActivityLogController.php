<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Spatie\Activitylog\Models\Activity;
use Illuminate\Support\Facades\DB;

class ActivityLogController extends Controller
{
    /**
     * Lấy danh sách activity logs dựa theo subject_id (tương ứng với cardId)
     */
    public function getActivitiesByCard($cardId)
    {
        // Lấy danh sách activity logs dựa theo subject_id (tương ứng với cardId)
        $activities = Activity::where('subject_id', $cardId)
            ->with('causer') // Tải thông tin causer (User)
            ->orderBy('created_at', 'desc')
            ->get();

        // Định dạng dữ liệu trả về
        $formattedActivities = $activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'full_name' => $activity->causer->full_name,
                    'user_name' => $activity->causer->user_name, // Thêm user_name
                    'initials' => $activity->causer->initials,   // Thêm initials
                    'image' => $activity->causer->image,         // Thêm image (avatar)
                ] : null,
                'properties' => $activity->properties->toArray(),
                'created_at' => $activity->created_at->toDateTimeString(),
                'relative_time' => $activity->created_at->diffForHumans(), // Thêm thời gian tương đối
                'updated_at' => $activity->updated_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Danh sách activity logs',
            'activities' => $formattedActivities
        ], 200);
    }

    /**
     * Lấy tất cả activity logs liên quan đến card (bao gồm checklists, checklist items, comments, v.v.)
     */
    public function getActivityLogForCard($cardId)
    {
        // Kiểm tra card tồn tại
        $cardExists = DB::table('cards')
            ->where('id', $cardId)
            ->exists();

        if (!$cardExists) {
            return response()->json([
                'status' => 'error',
                'message' => 'Card not found',
                'activities' => []
            ], 404);
        }

        // Lấy tất cả checklist IDs thuộc card
        $checklistIds = DB::table('checklists')
            ->where('card_id', $cardId)
            ->pluck('id')
            ->toArray();

        // Lấy tất cả checklist item IDs thuộc các checklist của card
        $checklistItemIds = DB::table('checklist_items')
            ->whereIn('checklist_id', $checklistIds)
            ->pluck('id')
            ->toArray();

        // Truy vấn activity_log
        $activities = Activity::where(function ($query) use ($cardId, $checklistIds, $checklistItemIds) {
            // Hoạt động trực tiếp trên card
            $query->where('subject_type', 'App\Models\Card')
                ->where('subject_id', $cardId)
                // Hoạt động trên checklists của card
                ->orWhere(function ($subQuery) use ($cardId) {
                    $subQuery->where('subject_type', 'App\Models\Card')
                        ->where('properties->card_id', $cardId);
                })
                // Hoạt động trên checklist items
                ->orWhere(function ($subQuery) use ($checklistItemIds) {
                    $subQuery->where('subject_type', 'App\Models\ChecklistItem')
                        ->whereIn('subject_id', $checklistItemIds);
                })
                // Hoạt động trên bình luận của card
                ->orWhere(function ($subQuery) use ($cardId) {
                    $subQuery->where('subject_type', 'App\Models\CommentCard')
                        ->where('properties->card_id', $cardId);
                });
        })
            ->with('causer') // Tải thông tin causer (User)
            ->orderBy('created_at', 'desc')
            ->get();

        // Định dạng dữ liệu trả về
        $formattedActivities = $activities->map(function ($activity) {
            return [
                'id' => $activity->id,
                'log_name' => $activity->log_name,
                'description' => $activity->description,
                'subject_type' => $activity->subject_type,
                'subject_id' => $activity->subject_id,
                'event' => $activity->event,
                'causer' => $activity->causer ? [
                    'id' => $activity->causer->id,
                    'full_name' => $activity->causer->full_name,
                    'user_name' => $activity->causer->user_name, // Thêm user_name
                    'initials' => $activity->causer->initials,   // Thêm initials
                    'image' => $activity->causer->image,         // Thêm image (avatar)
                ] : null,
                'properties' => $activity->properties->toArray(),
                'created_at' => $activity->created_at->toDateTimeString(),
                'relative_time' => $activity->created_at->diffForHumans(), // Thêm thời gian tương đối
                'updated_at' => $activity->updated_at->toDateTimeString(),
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Danh sách activity logs liên quan đến card',
            'activities' => $formattedActivities
        ], 200);
    }
}
