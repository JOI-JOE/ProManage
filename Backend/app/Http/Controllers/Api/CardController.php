<?php

namespace App\Http\Controllers\api;

use App\Events\CardCreate;
use App\Http\Controllers\Controller;
use App\Models\Card;
use Illuminate\Http\Request;

class CardController extends Controller
{
    public function store(Request $request)
    {
        $card = Card::create([
            'title' => $request->title,
            'list_board_id' => $request->list_board_id,
        ]);
    
        broadcast(new CardCreate($card))->toOthers();
    
        return response()->json($card);
    }
}
