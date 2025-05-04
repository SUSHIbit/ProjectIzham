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
                'actual_hp' => 100,
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
    
    public function upgradeStats(Request $request)
    {
        $request->validate([
            'stat' => 'required|in:attack,defense,heal,max_hp',
        ]);
        
        $player = Auth::user()->player;
        
        switch ($request->stat) {
            case 'attack':
                $player->min_attack += 10;
                $player->max_attack += 10;
                break;
            case 'defense':
                $player->defense += 10;
                break;
            case 'heal':
                $player->heal_value += 10;
                break;
            case 'max_hp':
                $player->hp += 20;
                $player->actual_hp += 20;
                break;
        }
        
        $player->save();
        
        return response()->json($player);
    }
    
    public function updatePlayerState(Request $request)
    {
        $request->validate([
            'level' => 'required|integer|min:1',
            'actual_hp' => 'required|integer|min:0',
        ]);
        
        $player = Auth::user()->player;
        $player->level = $request->level;
        $player->actual_hp = $request->actual_hp;
        $player->save();
        
        return response()->json($player);
    }
}