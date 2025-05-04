<?php

namespace App\Http\Controllers;

use App\Models\Enemy;
use App\Models\Leaderboard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    public function getAllEnemies()
    {
        $player = Auth::user()->player;
        $enemies = Enemy::with('questions')
            ->where('min_level', '<=', $player->level)
            ->where('max_level', '>=', $player->level)
            ->get();
        
        // Shuffle enemies
        $enemies = $enemies->shuffle();
        
        // For each enemy, shuffle their questions
        foreach ($enemies as $enemy) {
            $enemy->questions = $enemy->questions->shuffle();
        }
        
        return response()->json($enemies);
    }
    
    public function updateLeaderboard(Request $request)
    {
        $request->validate([
            'level' => 'required|integer|min:1',
        ]);
        
        $player = Auth::user()->player;
        $player->level = $request->level;
        $player->save();
        
        $leaderboard = $player->leaderboard;
        
        if (!$leaderboard) {
            $leaderboard = Leaderboard::create([
                'player_id' => $player->id,
                'highest_level' => $request->level,
            ]);
        } else if ($request->level > $leaderboard->highest_level) {
            $leaderboard->update([
                'highest_level' => $request->level,
            ]);
        }
        
        return response()->json($leaderboard);
    }
}