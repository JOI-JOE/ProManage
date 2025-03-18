<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
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
}
