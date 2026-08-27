<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GuaraniController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\NewsController;
use Illuminate\Support\Facades\Route;

Route::get('/v1/health', HealthController::class)->withoutMiddleware('auth:sanctum');

Route::get('/v1/news', [NewsController::class, 'index'])->withoutMiddleware('auth:sanctum');
Route::get('/v1/news/{id}', [NewsController::class, 'show'])->withoutMiddleware('auth:sanctum');

Route::post('/v1/auth/register', [AuthController::class, 'register'])->withoutMiddleware('auth:sanctum');
Route::post('/v1/auth/login', [AuthController::class, 'login'])->withoutMiddleware('auth:sanctum');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/v1/auth/logout', [AuthController::class, 'logout']);
    Route::get('/v1/auth/me', [AuthController::class, 'me']);

    Route::middleware('student')->prefix('v1/guarani')->group(function () {
        Route::get('/student', [GuaraniController::class, 'student']);
        Route::get('/subjects', [GuaraniController::class, 'subjects']);
        Route::get('/schedule', [GuaraniController::class, 'schedule']);
        Route::get('/correlativities', [GuaraniController::class, 'correlativities']);
    });
});
