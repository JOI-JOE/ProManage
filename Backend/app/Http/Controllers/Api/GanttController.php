<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Card;
use App\Models\ChecklistItem;
use Carbon\Carbon;

class GanttController extends Controller
{
    public function getGanttData(Request $request, $boardId)
    {
        // Lấy tất cả các card trong board
        $cards = Card::whereHas('listBoard', function($query) use ($boardId) {
            $query->where('board_id', $boardId);
        })->get();

        $tasks = [];

        foreach ($cards as $card) {
            // Nếu card không có ngày bắt đầu hoặc ngày kết thúc, bỏ qua
            if (is_null($card->start_date) || is_null($card->end_date)) {
                continue;
            }

            // Đảm bảo ngày hợp lệ trước khi parse
            try {
                // Định dạng ngày tháng theo yêu cầu của Frappe Gantt
                $startDate = Carbon::parse($card->start_date)->format('Y-m-d');
                $endDate = Carbon::parse($card->end_date)->format('Y-m-d');
                
                // Đảm bảo ngày kết thúc không trước ngày bắt đầu
                if (Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
                    $endDate = $startDate;
                }
            } catch (\Exception $e) {
                // Bỏ qua nếu ngày không hợp lệ
                continue;
            }

            // Tính toán tiến độ dựa trên các checklist
            $progress = 0;
            $checklistItems = ChecklistItem::whereHas('checklist', function($query) use ($card) {
                $query->where('card_id', $card->id);
            })->get();
            
            if (count($checklistItems) > 0) {
                $completedItems = $checklistItems->where('is_completed', 1)->count();
                $progress = ($completedItems / count($checklistItems)) * 100;
            }

            // Lấy thông tin người được giao
            $assignees = $card->users()->exists() ? $card->users->pluck('full_name')->toArray() : [];

            $tasks[] = [
                'id' => (string)$card->id, // Đảm bảo id là string
                'name' => $card->title ?? 'Untitled Card', // Thêm giá trị mặc định
                'start' => $startDate,
                'end' => $endDate,
                'progress' => round($progress, 0), // Làm tròn giá trị
                'dependencies' => '', 
                'custom_class' => $card->is_completed ? 'task-completed' : '',
                'assignees' => $assignees,
                'description' => $card->description ?? ''
            ];
        }

        // Tạo thêm subtasks từ các checklist items
        foreach ($cards as $card) {
            if (!$card->checklists()->exists()) {
                continue;
            }
            
            $checklists = $card->checklists;
            foreach ($checklists as $checklist) {
                foreach ($checklist->items as $item) {
                    if (is_null($item->start_date) || is_null($item->end_date)) {
                        continue;
                    }

                    try {
                        $startDate = Carbon::parse($item->start_date)->format('Y-m-d');
                        $endDate = Carbon::parse($item->end_date)->format('Y-m-d');
                        
                        // Đảm bảo ngày kết thúc không trước ngày bắt đầu
                        if (Carbon::parse($endDate)->lt(Carbon::parse($startDate))) {
                            $endDate = $startDate;
                        }
                    } catch (\Exception $e) {
                        // Bỏ qua nếu ngày không hợp lệ
                        continue;
                    }

                    // Lấy thông tin người được giao
                    $assignees = $item->members()->exists() ? $item->members->pluck('full_name')->toArray() : [];

                    $tasks[] = [
                        'id' => 'item_' . $item->id,
                        'name' => $item->name ?? 'Untitled Item',
                        'start' => $startDate,
                        'end' => $endDate,
                        'parent' => (string)$card->id, // Liên kết với task cha
                        'progress' => $item->is_completed ? 100 : 0,
                        'dependencies' => (string)$card->id, // Phụ thuộc vào card cha
                        'custom_class' => $item->is_completed ? 'subtask-completed' : 'subtask',
                        'assignees' => $assignees,
                        'description' => ''
                    ];
                }
            }
        }

        // Kiểm tra và đảm bảo không có dữ liệu NULL/undefined được trả về
        $validTasks = array_filter($tasks, function($task) {
            return isset($task['id']) && 
                   isset($task['name']) && 
                   isset($task['start']) && 
                   isset($task['end']);
        });

        return response()->json(array_values($validTasks)); // Đảm bảo mảng liên tục
    }

    // Thêm phương thức cập nhật thời gian từ biểu đồ Gantt
    public function updateTask(Request $request)
    {
        $taskId = $request->input('id');
        $startDate = $request->input('start');
        $endDate = $request->input('end');
        
        // Kiểm tra dữ liệu đầu vào
        if (!$taskId || !$startDate || !$endDate) {
            return response()->json(['success' => false, 'message' => 'Missing required fields'], 400);
        }
        
        try {
            if (strpos($taskId, 'item_') === 0) {
                // Cập nhật checklist item
                $itemId = substr($taskId, 5);
                $item = ChecklistItem::find($itemId);
                if ($item) {
                    $item->start_date = Carbon::parse($startDate)->toDateTimeString();
                    $item->end_date = Carbon::parse($endDate)->toDateString();
                    $item->save();
                    return response()->json(['success' => true]);
                }
            } else {
                // Cập nhật card
                $card = Card::find($taskId);
                if ($card) {
                    $card->start_date = Carbon::parse($startDate)->toDateTimeString();
                    $card->end_date = Carbon::parse($endDate)->toDateString();
                    $card->save();
                    return response()->json(['success' => true]);
                }
            }
            
            return response()->json(['success' => false, 'message' => 'Task not found'], 404);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}