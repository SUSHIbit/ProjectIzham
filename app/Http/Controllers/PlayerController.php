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
                'upgrades_used' => 0,
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
        
        // Check if player has upgrades available
        $totalUpgrades = floor($player->level / 5);
        $usedUpgrades = $player->upgrades_used;
        
        if ($usedUpgrades >= $totalUpgrades) {
            return response()->json(['error' => 'No upgrades available'], 400);
        }
        
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
        
        // Increment upgrades used
        $player->upgrades_used += 1;
        $player->save();
        
        return response()->json($player);
    }
    
    public function updatePlayerState(Request $request)
    {
        $request->validate([
            'level' => 'required|integer|min:1',
            'actual_hp' => 'required|integer|min:0',
            'reset_to_max' => 'boolean'
        ]);
        
        $player = Auth::user()->player;
        $player->level = $request->level;
        
        // If reset_to_max is true or hp is 0, set to max
        if ($request->reset_to_max || $request->actual_hp <= 0) {
            $player->actual_hp = $player->hp;
        } else {
            $player->actual_hp = $request->actual_hp;
        }
        
        $player->save();
        
        // Update leaderboard if this is a new highest level
        $leaderboard = $player->leaderboard;
        if ($leaderboard && $request->level > $leaderboard->highest_level) {
            $leaderboard->update([
                'highest_level' => $request->level,
            ]);
        }
        
        return response()->json($player);
    }
}