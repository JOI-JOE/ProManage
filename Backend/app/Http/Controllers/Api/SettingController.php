<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;

class SettingController extends Controller
{
    public function index()
    {
        $setting = Setting::first();
        return response()->json([
            'data' => [
                'site_name'      => $setting->site_name,
                'logo_url'       => $setting->logo ? asset('storage/' . $setting->logo) : null,
                'description'    => $setting->description,
                'contact_email'  => $setting->contact_email,
            ]
        ]);
    }
}
