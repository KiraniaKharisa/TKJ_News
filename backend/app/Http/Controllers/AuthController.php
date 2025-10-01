<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Email atau password salah',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user'    => $user,
            'token'   => $token,
        ]);

    }

    public function me(Request $request)
    {
        return response()->json([
            'user'    => $request->user(),
            'role'  => $request->user()->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();


        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
}
