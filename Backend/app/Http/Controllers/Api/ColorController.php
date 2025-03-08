<?php

namespace App\Http\Controllers\Api;

use App\Models\Color;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Cache;

class ColorController extends Controller
{
    public function index()
    {
        try {
            $colors = Cache::remember('colors_list', 3600, function () {
                return Color::all() ?? []; // Trả về mảng rỗng nếu không có dữ liệu
            });
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
