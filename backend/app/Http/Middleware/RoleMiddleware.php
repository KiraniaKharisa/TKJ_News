<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        // Pastikan user sudah login
        $user = $request->user();
        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.'
            ], 401);
        }

        // Cek role user
        if ($user->role !== $role) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak, role harus ' . $role
            ], 403);
        }

        return $next($request);
    }
}
