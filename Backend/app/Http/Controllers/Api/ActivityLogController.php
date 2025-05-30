<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function getActivitiesByCard($cardId)
    {
        // Lấy danh sách activity logs dựa theo subject_id (tương ứng với cardId)
        $activities = Activity::where('subject_id', $cardId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Danh sách activity logs',
            'activities' => $activities
        ], 200);
    }
    public function getMyActivities()
    {
        $user = Auth::user();
    
        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Người dùng chưa được xác thực.'
            ], 401);
        }
    
        $activities = Activity::where(function ($query) use ($user) {
                $query->where('causer_id', $user->id)
                    ->orWhereJsonContains('properties->user_id', $user->id)
                    ->orWhereJsonContains('properties->full_name', $user->id); // nếu bạn lưu mảng members
            })
            ->orderBy('updated_at', 'desc')
            ->with(['causer']) // load người thực hiện
            ->get();
    
        return response()->json([
            'status' => 'success',
            'message' => 'Danh sách activity liên quan đến bạn',
            'activities' => $activities
        ], 200);
    }
    


}
