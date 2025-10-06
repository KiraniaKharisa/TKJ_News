<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if(!Auth::attempt($request->only('email', 'password'))){
            return response()->json([
                'success' => true,
                'message' => 'Email atau password salah',
            ]);
        }

        $user = User::where('email', $request->email)->first();

        Auth::login($user);
        $request->session()->regenerate();
        
        return $request->user();

        // $token = $user->createToken('auth_token')->plainTextToken;

        // return response()->json([
        //     'success' => true,
        //     'user'    => $user,
        //     'token'   => $token,
        // ]);

    }

    public function me(Request $request)
    {
        $id = $request->user()->id;
        $user = User::with('role')->find($id);
        return response()->json([
            'sukses'    => true,
            'user'  => $user,
        ]);
    }

    public function logout(Request $request)
    {
        // $request->user()->tokens()->delete();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logout berhasil',
        ]);
    }
}
