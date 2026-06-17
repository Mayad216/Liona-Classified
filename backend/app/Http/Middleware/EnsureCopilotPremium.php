<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCopilotPremium
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isPremium()) {
            abort(403, 'This feature requires an active Jobs Copilot premium plan.');
        }

        return $next($request);
    }
}
