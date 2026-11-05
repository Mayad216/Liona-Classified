<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'app' => config('app.name'),
    'version' => '1.0.0',
    'docs' => '/api/v1',
]));

Route::get('/railway-health.txt', function () {
    try {
        if (config('database.default') !== 'sqlite') {
            DB::connection()->getPdo();
        }

        return response('ok', 200, ['Content-Type' => 'text/plain']);
    } catch (Throwable) {
        return response('database unavailable', 503, ['Content-Type' => 'text/plain']);
    }
});
