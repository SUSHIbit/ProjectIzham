<?php

namespace App\Http\Controllers;

use App\Models\Enemy;
use App\Models\Leaderboard;
use App\Models\GameState;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GameController extends Controller
{
    public function getAllEnemies()
    {
        // Just return all enemies, the battle level logic is now handled in frontend
        $allEnemies = Enemy::with('questions')->get();
        
        // If no enemies available, return empty array
        if ($allEnemies->isEmpty()) {
            return response()->json([]);
        }
        
        // Process each enemy to prepare shuffled questions
        $preparedEnemies = $allEnemies->map(function ($enemy) {
            // Get the questions for this enemy
            $questions = $enemy->questions;
            
            // Check if we have any stored question order for this enemy
            $questionShuffleOrder = $enemy->question_shuffle_order 
                ? json_decode($enemy->question_shuffle_order, true) 
                : null;
            
            // If no stored order or mismatched count, create new order
            if (empty($questionShuffleOrder) || count($questionShuffleOrder) !== $questions->count()) {
                $questionShuffleOrder = $questions->pluck('id')->shuffle()->toArray();
                
                // Update enemy with new shuffle order
                $enemy->update(['question_shuffle_order' => json_encode($questionShuffleOrder)]);
            }
            
            // Sort questions by shuffle order
            $sortedQuestions = collect();
            foreach ($questionShuffleOrder as $qId) {
                $question = $questions->firstWhere('id', $qId);
                if ($question) {
                    $sortedQuestions->push($question);
                }
            }
            
            $enemy->questions = $sortedQuestions;
            return $enemy;
        });
        
        return response()->json($preparedEnemies);
    }
    
    public function updateLeaderboard(Request $request)
    {
        $request->validate([
            'level' => 'required|integer|min:1',
        ]);
        
        $player = Auth::user()->player;
        
        // Update or create leaderboard entry with highest level
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
    
    public function shuffleQuestions(Enemy $enemy)
    {
        $questions = $enemy->questions;
        
        if ($questions->isEmpty()) {
            return response()->json([]);
        }
        
        $questionShuffleOrder = $questions->pluck('id')->shuffle()->toArray();
        
        // Update enemy with new shuffle order
        $enemy->update(['question_shuffle_order' => json_encode($questionShuffleOrder)]);
        
        return response()->json(['question_ids' => $questionShuffleOrder]);
    }
    
    public function getGameState()
    {
        $player = Auth::user()->player;
        $gameState = GameState::where('player_id', $player->id)->first();
        
        if ($gameState) {
            return response()->json([
                'battle_level' => $gameState->battle_level,
                'current_enemy_index' => $gameState->current_enemy_index,
                'current_question_index' => $gameState->current_question_index,
            ]);
        }
        
        return response()->json([]);
    }
    
    public function saveGameState(Request $request)
    {
        $player = Auth::user()->player;
        
        $gameState = GameState::updateOrCreate(
            ['player_id' => $player->id],
            [
                'battle_level' => $request->battle_level,
                'current_enemy_index' => $request->current_enemy_index,
                'current_question_index' => $request->current_question_index,
            ]
        );
        
        return response()->json($gameState);
    }
}