<?php

use Illuminate\Database\QueryException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: '*');
        $middleware->statefulApi();
        $middleware->api(prepend: [
            EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->alias([
            'admin' => \App\Http\Middleware\EnsureAdmin::class,
            'copilot.premium' => \App\Http\Middleware\EnsureCopilotPremium::class,
            'copilot.worker' => \App\Http\Middleware\EnsureCopilotAutoApplyWorker::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof QueryException) {
                return response()->json([
                    'message' => 'Database is temporarily unavailable. Please try again shortly.',
                ], 503);
            }

            $message = $e->getMessage();
            $databaseUnavailable = str_contains($message, 'Connection refused')
                || str_contains($message, 'SQLSTATE[HY000] [2002]')
                || str_contains($message, 'getaddrinfo failed')
                || str_contains($message, 'no such table')
                || str_contains($message, 'could not find driver');

            if ($databaseUnavailable) {
                return response()->json([
                    'message' => 'Database is temporarily unavailable. Please try again shortly.',
                ], 503);
            }

            return null;
        });
    })
    ->create();
