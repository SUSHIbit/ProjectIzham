<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PlayerController;
use App\Http\Controllers\EnemyController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\GameController;
use App\Http\Controllers\LeaderboardController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
   Route::post('/logout', [AuthController::class, 'logout']);
   Route::get('/user', [AuthController::class, 'user']);
   
   // Player routes
   Route::middleware('player')->group(function () {
       Route::get('/player/profile', [PlayerController::class, 'getProfile']);
       Route::put('/player/profile', [PlayerController::class, 'updateProfile']);
       Route::post('/player/upgrade-stats', [PlayerController::class, 'upgradeStats']);
       Route::post('/player/update-state', [PlayerController::class, 'updatePlayerState']);
       Route::get('/game/enemies', [GameController::class, 'getAllEnemies']);
       Route::post('/game/leaderboard', [GameController::class, 'updateLeaderboard']);
       Route::get('/leaderboard', [LeaderboardController::class, 'index']);
       Route::post('/game/state', [GameController::class, 'saveGameState']);
       Route::get('/game/state', [GameController::class, 'getGameState']);
       Route::post('/game/exit', [GameController::class, 'exitGame']);
   });
   
   // Admin routes
   Route::middleware('admin')->prefix('admin')->group(function () {
       // Enemy management
       Route::apiResource('enemies', EnemyController::class);
       
       // Question management
       Route::apiResource('questions', QuestionController::class);
       Route::get('/enemy/{enemy}/questions', [QuestionController::class, 'getByEnemy']);
   });
});
