<?php

namespace App\Http\Controllers;

use App\Models\Player;
use App\Models\Leaderboard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlayerController extends Controller
{
    public function getProfile()
    {
        $user = Auth::user();
        $player = $user->player;
        
        if (!$player) {
            $player = Player::create([
                'user_id' => $user->id,
                'character_name' => 'Adventurer',
                'level' => 1,
                'hp' => 100,
                'defense' => 5,
                'min_attack' => 10,
                'max_attack' => 15,
                'heal_value' => 20,
            ]);
            
            // Create leaderboard entry
            Leaderboard::create([
                'player_id' => $player->id,
                'highest_level' => 1,
            ]);
        }
        
        return response()->json($player);
    }
    
    public function updateProfile(Request $request)
    {
        $request->validate([
            'character_name' => 'required|string|max:255',
        ]);
        
        $player = Auth::user()->player;
        $player->update([
            'character_name' => $request->character_name,
        ]);
        
        return response()->json($player);
    }
}