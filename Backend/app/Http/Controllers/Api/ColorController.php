<?php

namespace App\Http\Controllers\Api;

use App\Models\Color;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class ColorController extends Controller
{
    public function index()
    {
        try {
            $colors = Color::all();
        return response()->json(
           [
            'success' => true,
            'message' => 'lay mau thanh cong',
            'data' => $colors
           ]
        );
        } catch (\Throwable $th) {
            return response()->json(
                [
                 'success' => false,
                 'message' => 'lay mau khong thanh cong',
              
                ]
             );
        }
    }
}
