<?php

namespace App\Http\Controllers;

use App\Models\Leaderboard;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    public function index()
    {
        $leaderboard = Leaderboard::with(['player', 'player.user'])
            ->orderBy('highest_level', 'desc')
            ->get()
            ->map(function ($entry) {
                return [
                    'character_name' => $entry->player->character_name,
                    'player_name' => $entry->player->user->name,
                    'highest_level' => $entry->highest_level,
                ];
            });
        
        return response()->json($leaderboard);
    }
}