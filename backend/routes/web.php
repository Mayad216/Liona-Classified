<?php

use Illuminate\Support\Facades\Route;

Route::get('/', fn () => response()->json([
    'app' => config('app.name'),
    'version' => '1.0.0',
    'docs' => '/api/v1',
]));

Route::get('/railway-health.txt', function () {
    // Liveness only. Railway fails the deploy on any non-200, so this must
    // not depend on MySQL. Use /up if you need a readiness probe.
    return response('ok', 200, ['Content-Type' => 'text/plain']);
});
