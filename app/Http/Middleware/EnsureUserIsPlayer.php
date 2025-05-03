<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsPlayer
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isPlayer()) {
            return response()->json(['error' => 'Unauthorized. Player access required.'], 403);
        }

        return $next($request);
    }
}