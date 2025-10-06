<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\KategoriController;

Route::post('/login', [AuthController::class, 'login']);
Route::resource('berita', BeritaController::class)->only(['index', 'show']);
Route::resource('kategori', KategoriController::class)->only(['index', 'show']);
Route::get('/terbaru', [BeritaController::class, 'terbaru']);
Route::get('/populer', [BeritaController::class, 'populer']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/detailberitaku', [BeritaController::class, 'getDetailBeritaku']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/like', [BeritaController::class, 'like']);
    Route::post('/unlike', [BeritaController::class, 'unlike']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::resource('kategori', KategoriController::class)->only(['store', 'update', 'destroy']);
    Route::resource('berita', BeritaController::class)->only(['store', 'update', 'destroy']);

    Route::middleware('role:admin')->group(function () {
        Route::resource('role', RoleController::class);
        Route::resource('user', UserController::class);
    });
});
