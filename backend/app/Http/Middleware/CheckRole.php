<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  $role
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        if (!$request->user()) {
            return response()->json([
                'message' => 'Authentication required',
            ], 401);
        }

        if (!$request->user()->hasRole($role)) {
            return response()->json([
                'message' => 'Insufficient permissions. Required role: ' . $role,
            ], 403);
        }

        return $next($request);
    }
}
