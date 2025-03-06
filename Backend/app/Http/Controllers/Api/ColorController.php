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
            return Cache::remember('colors', 3600, function () {
                return Color::select('id', 'hex_code')->get(); // Truy vấn chỉ 1 lần mỗi giờ
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
