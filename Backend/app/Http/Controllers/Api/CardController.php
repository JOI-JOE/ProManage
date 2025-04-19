<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreated;
use App\Events\CardUpdated;
use App\Http\Controllers\Controller;
use App\Jobs\BroadcastCardCreated;
use App\Models\Card;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;

class CardController extends Controller
{
    public function show($cardId)
    {
        // Unchanged: Returns full card data for initial fetch
        $card = DB::table('cards')
            ->select([
                'cards.id',
                'cards.title',
                'cards.description',
                'cards.thumbnail',
                'cards.position',
                'cards.start_date',
                'cards.end_date',
                'cards.end_time',
                'cards.reminder',
                'cards.is_completed',
                'cards.is_archived',
                'cards.list_board_id',
                'list_boards.name as list_board_name',
                DB::raw('(SELECT COUNT(*) FROM comment_cards WHERE comment_cards.card_id = cards.id) as comment_count'),
                DB::raw('(SELECT COUNT(*) FROM attachments WHERE attachments.card_id = cards.id) as attachment_count'),
                DB::raw('(
                    SELECT COUNT(*) 
                    FROM checklists cl 
                    JOIN checklist_items cli ON cl.id = cli.checklist_id 
                    WHERE cl.card_id = cards.id
                ) as total_checklist_items'),
                DB::raw('(
                    SELECT COUNT(*) 
                    FROM checklists cl 
                    JOIN checklist_items cli ON cl.id = cli.checklist_id 
                    WHERE cl.card_id = cards.id AND cli.is_completed = 1
                ) as completed_checklist_items')
            ])
            ->join('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
            ->where('cards.id', $cardId)
            ->where('cards.is_archived', 0)
            ->first();

        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $labels = DB::table('card_label')
            ->join('labels', 'card_label.label_id', '=', 'labels.id')
            ->select('labels.id as label_id', 'labels.title', 'labels.color_id')
            ->where('card_label.card_id', $cardId)
            ->get()
            ->map(function ($label) {
                return [
                    'id' => $label->label_id,
                    'name' => $label->title,
                    'color' => $label->color_id,
                ];
            });

        $labelIds = $labels->pluck('id');
        $memberIds = DB::table('card_user')
            ->where('card_user.card_id', $cardId)
            ->pluck('user_id');
        $checklistsIds = DB::table('checklists')
            ->where('card_id', $cardId)
            ->pluck('id');

        return [
            'id' => $card->id,
            'title' => $card->title,
            'description' => $card->description,
            'thumbnail' => $card->thumbnail,
            'position' => (float)$card->position,
            'is_archived' => (bool)$card->is_archived,
            'list_board_id' => $card->list_board_id,
            'list_board_name' => $card->list_board_name,
            'labelId' => $labelIds,
            'labels' => $labels,
            'membersId' => $memberIds,
            'checklistsId' => $checklistsIds,
            'badges' => [
                'attachments' => (int)$card->attachment_count,
                'comments' => (int)$card->comment_count,
                'start' => $card->start_date,
                'due' => $card->end_date,
                'dueTime' => $card->end_time,
                'dueReminder' => $card->reminder,
                'dueComplete' => (bool)$card->is_completed,
                'checkItems' => (int)$card->total_checklist_items,
                'checkItemsChecked' => (int)$card->completed_checklist_items,
                'description' => !empty($card->description),
            ],
        ];
    }

    public function store(Request $request)
    {
        // Unchanged: Broadcasts CardCreated, not CardUpdated
        $validator = Validator::make($request->all(), [
            'columnId' => 'required|uuid|exists:list_boards,id',
            'position' => 'required|numeric',
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        DB::beginTransaction();
        try {
            $card = Card::create([
                'list_board_id' => $request->columnId,
                'position' => $request->position,
                'title' => $request->title,
            ]);

            DB::commit();

            try {
                broadcast(new CardCreated($card))->toOthers();
            } catch (Exception $e) {
                Log::error('Failed to broadcast CardCreated event: ' . $e->getMessage());
            }

            return response()->json($card, 201);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to create card: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create card.', 'error' => $e->getMessage()], 500);
        }
    }

    public function destroy($cardId)
    {
        // Unchanged: Uses CardDeleted (not implemented), not CardUpdated
        if (!Str::isUuid($cardId)) {
            return response()->json(['message' => 'Invalid card ID'], 422);
        }

        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $listBoardId = $card->list_board_id;

        DB::beginTransaction();
        try {
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'ai đó';

            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('deleted_card')
                ->withProperties([
                    'card_id' => $cardId,
                    'card_title' => $card->title,
                    'list_board_id' => $listBoardId,
                ])
                ->log("{$userName} đã xóa card '{$card->title}'.");

            $card->delete();

            DB::commit();

            try {
                // broadcast(new CardDeleted($cardId, $listBoardId))->toOthers();
                Log::info('CardDeleted event would be broadcast', ['card_id' => $cardId]);
            } catch (Exception $e) {
                Log::error('Failed to broadcast CardDeleted event: ' . $e->getMessage());
            }

            return response()->json(['message' => 'Card deleted successfully.'], 200);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to delete card: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to delete card.', 'error' => $e->getMessage()], 500);
        }
    }

    private function updateCardFields($card, $validatedData, $user, $userName)
    {
        try {
            $changes = [];
            $updatedFields = [];

            $fields = [
                'title',
                'description',
                'thumbnail',
                'start_date',
                'end_date',
                'end_time',
                'reminder',
                'is_completed',
                'is_archived'
            ];

            foreach ($fields as $field) {
                if (array_key_exists($field, $validatedData) && $card->$field != $validatedData[$field]) {
                    $changes[$field] = ['old' => $card->$field, 'new' => $validatedData[$field]];
                    $card->$field = $validatedData[$field];
                    $updatedFields[] = $field;
                    // Add 'badges' to updatedFields if date or completion fields change
                    if (in_array($field, ['start_date', 'end_date', 'end_time', 'reminder', 'is_completed', 'description'])) {
                        $updatedFields[] = 'badges';
                    }
                }
            }

            if (!empty($changes)) {
                $logMessage = "{$userName} đã cập nhật card: ";
                $logMessage .= collect($changes)->map(function ($change, $field) {
                    return "{$field} từ '" . ($change['old'] ?? 'không có') . "' thành '" . ($change['new'] ?? 'không có') . "'";
                })->implode(', ');

                activity()
                    ->causedBy($user)
                    ->performedOn($card)
                    ->event('updated_card')
                    ->withProperties(['changes' => $changes])
                    ->log($logMessage);
            }

            return [
                'status' => 'success',
                'updatedFields' => array_unique($updatedFields), // Ensure no duplicate fields
            ];
        } catch (Exception $e) {
            Log::error('Failed to update card fields: ' . $e->getMessage());
            return [
                'status' => 'error',
                'message' => 'Failed to update card fields.',
                'error' => $e->getMessage(),
            ];
        }
    }

    public function update(Request $request, $cardId)
    {
        if (!Str::isUuid($cardId)) {
            return response()->json(['message' => 'Invalid card ID'], 422);
        }

        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'thumbnail' => 'sometimes|nullable|string|max:255',
            'position' => 'sometimes|numeric|min:0',
            'start_date' => 'sometimes|nullable|date_format:Y-m-d',
            'end_date' => 'sometimes|nullable|date_format:Y-m-d',
            'end_time' => 'sometimes|nullable|date_format:H:i',
            'reminder' => 'sometimes|nullable|date_format:Y-m-d H:s',
            'is_completed' => 'sometimes|boolean',
            'is_archived' => 'sometimes|boolean',
            'list_board_id' => 'sometimes|required|uuid|exists:list_boards,id',
        ]);

        $card = Card::with('list_board')->find($cardId);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        if (!$card->list_board) {
            Log::warning('List board not found for card', [
                'card_id' => $cardId,
                'list_board_id' => $card->list_board_id
            ]);
            return response()->json(['message' => 'List board not found'], 404);
        }

        DB::beginTransaction();
        try {
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'Unknown';
            $updatedFields = [];

            // Handle card movement (position or list_board_id)
            if (isset($validatedData['list_board_id']) || isset($validatedData['position'])) {
                $targetListBoardId = $validatedData['list_board_id'] ?? $card->list_board_id;
                $position = $validatedData['position'] ?? $card->position;

                if ($card->list_board_id != $targetListBoardId) {
                    $oldListBoardName = $card->list_board->name;
                    $card->list_board_id = $targetListBoardId;
                    $updatedFields[] = 'list_board_id';
                }

                if ($card->position != $position) {
                    $card->position = $position;
                    $updatedFields[] = 'position';
                }
            }

            // Update other fields
            $updateResult = $this->updateCardFields($card, $validatedData, $user, $userName);
            if ($updateResult['status'] !== 'success') {
                return response()->json($updateResult, 500);
            }
            $updatedFields = array_merge($updatedFields, $updateResult['updatedFields']);

            $card->save();
            $card->refresh();

            // Broadcast CardUpdated with specific updated fields
            try {
                if (!empty($updatedFields)) {
                    broadcast(new CardUpdated($card))->toOthers();
                }
            } catch (Exception $e) {
                Log::error('Failed to broadcast CardUpdated event: ' . $e->getMessage(), [
                    'card_id' => $card->id,
                    'updated_fields' => $updatedFields,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Card updated successfully.',
                'card' => $card->load('list_board'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Failed to update card: ' . $e->getMessage(), [
                'card_id' => $cardId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Failed to update card.', 'error' => $e->getMessage()], 500);
        }
    }

    public function updatePositionCard(Request $request, $cardId)
    {
        try {
            $validated = $request->validate([
                'position' => 'required|numeric',
                'listId' => 'required|exists:list_boards,id',
            ]);

            $card = Card::findOrFail($cardId);
            $updatedFields = [];

            if ($card->position != $validated['position']) {
                $card->position = $validated['position'];
                $updatedFields[] = 'position';
            }

            if ($card->list_board_id != $validated['listId']) {
                $card->list_board_id = $validated['listId'];
                $updatedFields[] = 'list_board_id';
            }

            $card->save();

            try {
                broadcast(new CardUpdated($card))->toOthers();
            } catch (Exception $e) {
                Log::error('Failed to broadcast CardUpdated event: ' . $e->getMessage(), [
                    'card_id' => $card->id,
                    'updated_fields' => $updatedFields,
                ]);
            }

            return response()->json([
                'card' => $card,
            ]);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while updating card position.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function copy(Request $request, $cardId)
    {
        // Unchanged: Broadcasts CardCreated, not CardUpdated
        $validator = Validator::make($request->all(), [
            'targetListBoardId' => 'required|uuid|exists:list_boards,id',
            'position' => 'required|numeric',
            'keepLabels' => 'sometimes|boolean',
            'keepChecklists' => 'sometimes|boolean',
            'keepAttachments' => 'sometimes|boolean',
            'keepDates' => 'sometimes|boolean',
            'title' => 'required|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $sourceCard = DB::table('cards')
            ->where('id', $cardId)
            ->first();

        if (!$sourceCard) {
            return response()->json(['message' => 'Source card not found'], 404);
        }

        DB::beginTransaction();
        try {
            $newCardId = Str::uuid()->toString();
            $newCardData = [
                'id' => $newCardId,
                'title' => $request->title,
                'description' => $sourceCard->description,
                'thumbnail' => $sourceCard->thumbnail,
                'position' => $request->position,
                'list_board_id' => $request->targetListBoardId,
                'is_completed' => 0,
                'is_archived' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ];

            if ($request->input('keepDates', false)) {
                $newCardData['start_date'] = $sourceCard->start_date;
                $newCardData['end_date'] = $sourceCard->end_date;
                $newCardData['end_time'] = $sourceCard->end_time;
                $newCardData['reminder'] = $sourceCard->reminder;
            } else {
                $newCardData['start_date'] = null;
                $newCardData['end_date'] = null;
                $newCardData['end_time'] = null;
                $newCardData['reminder'] = null;
            }

            DB::table('cards')->insert($newCardData);

            if ($request->input('keepLabels', false)) {
                $labels = DB::table('card_label')
                    ->where('card_id', $cardId)
                    ->get()
                    ->map(function ($label) use ($newCardId) {
                        return [
                            'card_id' => $newCardId,
                            'label_id' => $label->label_id,
                        ];
                    })->toArray();

                if (!empty($labels)) {
                    DB::table('card_label')->insert($labels);
                }
            }

            if ($request->input('keepChecklists', false)) {
                $checklists = DB::table('checklists')
                    ->where('card_id', $cardId)
                    ->get();

                foreach ($checklists as $checklist) {
                    $newChecklistId = DB::table('checklists')->insertGetId([
                        'card_id' => $newCardId,
                        'name' => $checklist->name,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);

                    $items = DB::table('checklist_items')
                        ->where('checklist_id', $checklist->id)
                        ->get()
                        ->map(function ($item) use ($newChecklistId) {
                            return [
                                'checklist_id' => $newChecklistId,
                                'name' => $item->name,
                                'start_date' => $item->start_date,
                                'end_date' => $item->end_date,
                                'end_time' => $item->end_time,
                                'reminder' => $item->reminder,
                                'is_completed' => 0,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ];
                        })->toArray();

                    if (!empty($items)) {
                        DB::table('checklist_items')->insert($items);
                    }
                }
            }

            if ($request->input('keepAttachments', false)) {
                $attachments = DB::table('attachments')
                    ->where('card_id', $cardId)
                    ->get()
                    ->map(function ($attachment) use ($newCardId) {
                        $newAttachment = [
                            'id' => Str::uuid()->toString(),
                            'card_id' => $newCardId,
                            'type' => $attachment->type,
                            'file_name_defaut' => $attachment->file_name_defaut,
                            'is_cover' => $attachment->is_cover,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ];

                        if ($attachment->type === 'file') {
                            $originalFileName = $attachment->file_name;

                            if (!preg_match('/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/', $originalFileName)) {
                                $parsedPath = parse_url($attachment->path_url, PHP_URL_PATH);
                                $possibleFileName = basename($parsedPath);

                                if (preg_match('/^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9]+$/', $possibleFileName)) {
                                    $originalFileName = $possibleFileName;
                                } else {
                                    return null;
                                }
                            }

                            $extension = pathinfo($originalFileName, PATHINFO_EXTENSION);
                            $newFileName = Str::random(20) . '_' . time() . '.' . $extension;

                            $originalFilePath = 'attachments/' . $originalFileName;
                            $newFilePath = 'attachments/' . $newFileName;

                            if (Storage::disk('public')->exists($originalFilePath)) {
                                Storage::disk('public')->copy($originalFilePath, $newFilePath);
                            } else {
                                throw new Exception('Attachment file not found: ' . $originalFilePath);
                            }

                            $newPathUrl = asset('storage/attachments/' . $newFileName);
                            $newAttachment['file_name'] = $newFileName;
                            $newAttachment['path_url'] = $newPathUrl;
                        } else {
                            $parsedUrl = parse_url($attachment->path_url, PHP_URL_HOST) . parse_url($attachment->path_url, PHP_URL_PATH);
                            $safeName = preg_replace('/[^a-zA-Z0-9_\-]/', '', $parsedUrl);
                            $uniqueFileName = $safeName . '_' . Str::random(6);

                            $newAttachment['file_name'] = $uniqueFileName;
                            $newAttachment['path_url'] = $attachment->path_url;
                        }

                        return $newAttachment;
                    })
                    ->filter()
                    ->toArray();

                if (!empty($attachments)) {
                    DB::table('attachments')->insert($attachments);
                }
            }

            $user = auth()->user();
            $userName = $user ? $user->full_name : 'Someone';

            $sourceList = DB::table('list_boards')
                ->where('id', $sourceCard->list_board_id)
                ->select('name')
                ->first();

            $targetList = DB::table('list_boards')
                ->where('id', $request->targetListBoardId)
                ->select('name')
                ->first();

            $tempCard = new Card();
            $tempCard->id = $newCardId;
            $tempCard->title = $request->title;

            activity()
                ->causedBy($user)
                ->performedOn($tempCard)
                ->event('copied_card')
                ->withProperties([
                    'source_card_id' => $cardId,
                    'source_card_title' => $sourceCard->title,
                    'new_card_id' => $newCardId,
                    'new_card_title' => $request->title,
                    'source_list_id' => $sourceCard->list_board_id,
                    'source_list_name' => $sourceList->name ?? 'Unknown',
                    'target_list_id' => $request->targetListBoardId,
                    'target_list_name' => $targetList->name ?? 'Unknown',
                    'copied_elements' => [
                        'labels' => $request->input('keepLabels', false),
                        'checklists' => $request->input('keepChecklists', false),
                        'attachments' => $request->input('keepAttachments', false),
                        'dates' => $request->input('keepDates', false),
                    ],
                ])
                ->log("{$userName} copied card '{$sourceCard->title}' to list '{$targetList->name}'.");

            DB::commit();

            $newCard = DB::table('cards')->where('id', $newCardId)->first();
            $broadcastCard = new Card();
            $broadcastCard->id = $newCard->id;
            $broadcastCard->title = $newCard->title;
            $broadcastCard->description = $newCard->description;
            $broadcastCard->thumbnail = $newCard->thumbnail;
            $broadcastCard->position = $newCard->position;
            $broadcastCard->list_board_id = $newCard->list_board_id;
            $broadcastCard->is_completed = $newCard->is_completed;
            $broadcastCard->is_archived = $newCard->is_archived;
            $broadcastCard->start_date = $newCard->start_date;
            $broadcastCard->end_date = $newCard->end_date;
            $broadcastCard->end_time = $newCard->end_time;
            $broadcastCard->reminder = $newCard->reminder;
            $broadcastCard->created_at = $newCard->created_at;
            $broadcastCard->updated_at = $newCard->updated_at;

            broadcast(new CardCreated($broadcastCard))->toOthers();

            $newCardDetails = DB::table('cards')
                ->leftJoin('list_boards', 'cards.list_board_id', '=', 'list_boards.id')
                ->leftJoin('boards', 'list_boards.board_id', '=', 'boards.id')
                ->where('cards.id', $newCardId)
                ->select('cards.*', 'list_boards.name as list_name', 'boards.name as board_name')
                ->first();

            return response()->json([
                'message' => 'Card copied successfully.',
                'card' => $newCardDetails
            ], 201);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to copy card.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function move(Request $request, $cardId)
    {
        // Validate request
        $validator = Validator::make($request->all(), [
            'targetListBoardId' => 'required|uuid|exists:list_boards,id',
            'position' => 'required|numeric',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Find the card
        $card = Card::find($cardId);
        if (!$card) {
            return response()->json(['message' => 'Card not found'], 404);
        }

        $oldListBoardId = $card->list_board_id;
        $newListBoardId = $request->targetListBoardId;
        $newPosition = $request->position;
        $updatedFields = [];

        DB::beginTransaction();
        try {
            // Track updated fields
            if ($card->list_board_id != $newListBoardId) {
                $updatedFields[] = 'list_board_id';
            }
            if ($card->position != $newPosition) {
                $updatedFields[] = 'position';
            }

            // Update the card
            $card->list_board_id = $newListBoardId;
            $card->position = $newPosition;
            $card->is_archived = false; // Ensure card is unarchived when moved
            $card->save();

            // Log the activity
            $user = auth()->user();
            $userName = $user ? $user->full_name : 'ai đó';

            $oldList = DB::table('list_boards')->where('id', $oldListBoardId)->first();
            $newList = DB::table('list_boards')->where('id', $newListBoardId)->first();

            activity()
                ->causedBy($user)
                ->performedOn($card)
                ->event('moved_card')
                ->withProperties([
                    'card_id' => $cardId,
                    'old_list_board_id' => $oldListBoardId,
                    'new_list_board_id' => $newListBoardId,
                    'old_list_name' => $oldList->name ?? 'Không xác định',
                    'new_list_name' => $newList->name ?? 'Không xác định',
                    'new_position' => $newPosition
                ])
                ->log("{$userName} đã di chuyển card '{$card->title}' từ list '{$oldList->name}' sang list '{$newList->name}'.");

            // Broadcast CardUpdated with specific fields
            try {
                if (!empty($updatedFields)) {
                    // broadcast(new CardUpdated($card, array_unique($updatedFields)))->toOthers();
                }
            } catch (Exception $e) {
                Log::error('Failed to broadcast CardUpdated event: ' . $e->getMessage(), [
                    'card_id' => $cardId,
                    'updated_fields' => $updatedFields,
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Card moved successfully.',
                'card' => $this->show($cardId)
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Failed to move card.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
