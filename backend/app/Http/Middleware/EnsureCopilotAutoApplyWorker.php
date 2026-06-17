<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCopilotAutoApplyWorker
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = config('copilot.auto_apply.worker_secret');
        $provided = $request->header('X-Copilot-Worker-Secret');

        if (! $secret || ! hash_equals((string) $secret, (string) $provided)) {
            abort(403, 'Invalid worker credentials.');
        }

        return $next($request);
    }
}
