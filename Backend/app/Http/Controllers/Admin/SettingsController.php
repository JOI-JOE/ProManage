<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    //
    public function index()
    {
        // Lấy bản ghi đầu tiên (hoặc tạo bản ghi mặc định nếu chưa có)
        $setting = Setting::first() ?? Setting::create([
            'site_name' => 'Trello Clone',
            'logo' => null,

            'description' => 'Mô tả hệ thống',

            'contact_email' => 'support@example.com',
        ]);

        return view('admin.settings.index', compact('setting'));
    }
    public function edit($id){
        $setting=Setting::find($id);
        return view('admin.settings.edit',compact('setting'));
    }

    public function update(Request $request,$id)
    {
        $setting=Setting::find($id);

        $request->validate([
            'site_name' => 'required|string|max:255',
            'logo' => 'nullable|image|mimes:jpg,png,jpeg|max:2048',
            'description' => 'nullable|string',
            'contact_email' => 'required|email|max:255',
        ]);

        $setting->site_name = $request->site_name;

        // Xử lý upload logo
        if ($request->hasFile('logo')) {
            $setting->logo = $request->file('logo')->store('logos', 'public');
        }

        // Xử lý upload favicon

        $setting->description = $request->description;
        $setting->contact_email = $request->contact_email;

        $setting->save();

        return redirect()->route('admin.settings.index')->with('success', 'Cấu hình đã được cập nhật!');
    }
}
