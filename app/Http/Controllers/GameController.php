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
        
        // Get enemies for this level range and store the full enemy collection
        $allEnemies = Enemy::with('questions')
            ->where('min_level', '<=', $player->level)
            ->where('max_level', '>=', $player->level)
            ->get();
        
        // If no enemies available at this level, return empty
        if ($allEnemies->isEmpty()) {
            return response()->json([]);
        }
        
        // Shuffle the enemy collection
        $shuffledEnemies = $allEnemies->shuffle();
        
        // Process each enemy to prepare shuffled questions
        $preparedEnemies = $shuffledEnemies->map(function ($enemy) {
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
}