<?php

namespace App\Http\Controllers;

use App\Models\Question;
use App\Models\Enemy;
use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function index()
    {
        $questions = Question::with('enemy')->get();
        return response()->json($questions);
    }
    
    public function getByEnemy(Enemy $enemy)
    {
        $questions = $enemy->questions;
        return response()->json($questions);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'enemy_id' => 'required|exists:enemies,id',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|in:A,B,C,D',
        ]);
        
        $question = Question::create($request->all());
        
        return response()->json($question, 201);
    }
    
    public function show(Question $question)
    {
        return response()->json($question);
    }
    
    public function update(Request $request, Question $question)
    {
        $request->validate([
            'enemy_id' => 'required|exists:enemies,id',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|in:A,B,C,D',
        ]);
        
        $question->update($request->all());
        
        return response()->json($question);
    }
    
    public function destroy(Question $question)
    {
        $question->delete();
        
        return response()->json(null, 204);
    }
}