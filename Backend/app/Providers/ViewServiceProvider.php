<?php

namespace App\Providers;

use App\Models\Setting;
use Illuminate\Support\ServiceProvider;

class ViewServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot()
{
    // Chia sẻ biến $setting với tất cả các view
    view()->composer('*', function ($view) {
        $setting = Setting::first(); // lấy bản ghi đầu tiên
        $view->with('setting', $setting);
    });
}
}
