<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Models\Card;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\ListBoard;

class DragDropController extends Controller
{
    // Dành cho card trong cùng một column
    public function updateCardPositionsSameColumn(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|exists:cards,id',
            'cards.*.list_board_id' => 'required|exists:list_boards,id',
            'cards.*.position' => 'required|integer|min:0',
        ]);

        $cardsToUpdate = collect();

        DB::transaction(function () use ($validatedData, &$cardsToUpdate) {
            foreach ($validatedData['cards'] as $card) {
                // Lấy giá trị title từ database
                $existingCard = Card::find($card['id']);
                if (!$existingCard) {
                    throw new \Exception("Card not found: " . htmlspecialchars($card['id'], ENT_QUOTES, 'UTF-8'));
                }

                $cardsToUpdate->push([
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                    'title' => $existingCard->title, // Lấy giá trị title từ database
                ]);
            }

            // Batch update các card
            Card::upsert(
                $cardsToUpdate->toArray(),
                ['id'],
                ['list_board_id', 'position', 'title'] // Cập nhật cả title
            );
        });

        // Lấy dữ liệu sau khi cập nhật
        $updatedCards = Card::whereIn('id', $cardsToUpdate->pluck('id'))
            ->get(['id', 'list_board_id', 'position', 'title']);

        return response()->json([
            'message' => 'Cards reordered successfully!',
            'cards' => $updatedCards
        ], 200);
    }

    // Dành cho card khác column 
    public function updateCardPositionsDifferentColumn(Request $request)
    {
        // Validate dữ liệu đầu vào
        $validatedData = $request->validate([
            'cards' => 'required|array',
            'cards.*.id' => 'required|exists:cards,id',
            'cards.*.list_board_id' => 'required|exists:list_boards,id',
            'cards.*.position' => 'required|integer|min:0',
        ]);

        // Khởi tạo các biến để lưu trữ dữ liệu cần cập nhật
        $cardsToUpdate = collect();
        $affectedColumnIds = collect();

        // Bắt đầu transaction
        DB::transaction(function () use ($validatedData, &$cardsToUpdate, &$affectedColumnIds) {
            // Lặp qua từng card trong dữ liệu đầu vào
            foreach ($validatedData['cards'] as $card) {
                // Lấy columnId ban đầu của card
                $originalColumnId = Card::where('id', $card['id'])->value('list_board_id');

                // Nếu card di chuyển sang column mới, lưu cả column cũ và column mới vào danh sách cần cập nhật
                if ($originalColumnId !== $card['list_board_id']) {
                    $affectedColumnIds->push($originalColumnId);
                }
                $affectedColumnIds->push($card['list_board_id']);

                // Lấy giá trị title hiện tại của card
                $currentTitle = Card::where('id', $card['id'])->value('title');

                // Thêm card vào danh sách cần cập nhật
                $cardsToUpdate->push([
                    'id' => $card['id'],
                    'list_board_id' => $card['list_board_id'],
                    'position' => $card['position'],
                    'title' => $currentTitle, // Sử dụng giá trị title hiện tại
                ]);
            }

            // Batch update các card được di chuyển
            Card::upsert(
                $cardsToUpdate->toArray(),
                ['id'], // Khóa chính
                ['list_board_id', 'position'] // Các cột cần cập nhật (không bao gồm title)
            );

            // Cập nhật vị trí của các card trong các column bị ảnh hưởng
            $affectedColumnIds->unique()->each(function ($columnId) {
                Card::where('list_board_id', $columnId)
                    ->orderBy('position')
                    ->chunkById(100, function ($cards) {
                        $cards->each(function ($card, $index) {
                            $card->update(['position' => $index + 1]); // Cập nhật vị trí dựa trên chỉ số mảng
                        });
                    });
            });
        });

        // Trả về phản hồi thành công
        return response()->json([
            'message' => 'Cards updated successfully!',
        ], 200);
    }
    // Dành cho column
    public function updateListPosition(Request $request)
    {
        try {
            // Validate dữ liệu đầu vào
            $validatedData = $request->validate([
                'columns' => 'required|array|min:1',
                'columns.*.id' => 'required|exists:list_boards,id',
                'columns.*.position' => 'required|min:0',
                'columns.*.boardId' => 'required|integer|exists:boards,id', // Đảm bảo boardId tồn tại và là số nguyên
                'columns.*.title' => 'required|string',
            ]);

            // Bắt đầu transaction
            DB::transaction(function () use ($validatedData) {
                // Chuẩn bị dữ liệu để upsert
                $columnsToUpdate = collect($validatedData['columns'])->map(function ($column) {
                    // Kiểm tra xem boardId có tồn tại không
                    if (!isset($column['boardId'])) {
                        throw new \Exception("Thiếu trường boardId trong một hoặc nhiều cột.");
                    }

                    return [
                        'id' => $column['id'],
                        'board_id' => $column['boardId'],
                        'position' => $column['position'],
                        'name' => $column['title'], // Giả sử trường 'name' trong database tương ứng với 'title'
                    ];
                })->toArray();

                // Sử dụng upsert để cập nhật hoặc chèn dữ liệu
                try {
                    ListBoard::upsert(
                        $columnsToUpdate,
                        ['id'],
                        ['position', 'name'] // Cập nhật cả position và name
                    );
                } catch (\Exception $e) {
                    // Xử lý lỗi upsert
                    throw new \Exception('Đã xảy ra lỗi khi cập nhật vị trí cột. Vui lòng thử lại sau.');
                }
            });

            // Lấy lại dữ liệu mới của board sau khi cập nhật
            $boardId = $validatedData['columns'][0]['boardId']; // Lấy boardId từ cột đầu tiên
            $board = Board::with(['listBoards' => function ($query) {
                $query->orderBy('position');
            }])->findOrFail($boardId);

            // Format dữ liệu trả về
            $responseData = [
                'columns' => $board->listBoards->map(function ($list) {
                    return [
                        'id' => $list->id,
                        'boardId' => $list->board_id,
                        'position' => $list->position,
                        'title' => $list->name, // Giả sử trường 'name' trong database tương ứng với 'title'
                        'cardOrderIds' => $list->card_order_ids ?? [], // Sử dụng toán tử null coalescing để tránh lỗi
                        'cards' => $list->cards ?? [], // Sử dụng toán tử null coalescing để tránh lỗi
                    ];
                }),
            ];

            // Trả về phản hồi thành công cùng với dữ liệu mới
            return response()->json([
                'message' => 'Cập nhật vị trí thành công!',
                'data' => $responseData,
            ], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Xử lý lỗi validation
            return response()->json(['error' => 'Dữ liệu không hợp lệ', 'details' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Xử lý lỗi chung
            return response()->json(['error' => 'Lỗi cập nhật: ' . $e->getMessage()], 500);
        }
    }
}
