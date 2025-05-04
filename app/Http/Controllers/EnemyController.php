<?php

namespace App\Http\Controllers;

use App\Models\Enemy;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class EnemyController extends Controller
{
    public function index()
    {
        $enemies = Enemy::all();
        return response()->json($enemies);
    }
    
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hp' => 'required|integer|min:1',
            'min_attack' => 'required|integer|min:1',
            'max_attack' => 'required|integer|gte:min_attack',
            'defense' => 'required|integer|min:0',
            'image' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'min_level' => 'required|integer|min:1',
            'max_level' => 'required|integer|gte:min_level',
            'in_game_level' => 'required|integer|min:1',
        ]);
        
        $imagePath = $request->file('image')->store('public/enemies');
        
        $enemy = Enemy::create([
            'name' => $request->name,
            'hp' => $request->hp,
            'min_attack' => $request->min_attack,
            'max_attack' => $request->max_attack,
            'defense' => $request->defense,
            'image_path' => str_replace('public/', '', $imagePath),
            'min_level' => $request->min_level,
            'max_level' => $request->max_level,
            'in_game_level' => $request->in_game_level,
        ]);
        
        return response()->json($enemy, 201);
    }
    
    public function show(Enemy $enemy)
    {
        return response()->json($enemy);
    }
    
    public function update(Request $request, Enemy $enemy)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'hp' => 'required|integer|min:1',
            'min_attack' => 'required|integer|min:1',
            'max_attack' => 'required|integer|gte:min_attack',
            'defense' => 'required|integer|min:0',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'min_level' => 'required|integer|min:1',
            'max_level' => 'required|integer|gte:min_level',
            'in_game_level' => 'required|integer|min:1',
        ]);
        
        $data = [
            'name' => $request->name,
            'hp' => $request->hp,
            'min_attack' => $request->min_attack,
            'max_attack' => $request->max_attack,
            'defense' => $request->defense,
            'min_level' => $request->min_level,
            'max_level' => $request->max_level,
            'in_game_level' => $request->in_game_level,
        ];
        
        if ($request->hasFile('image')) {
            // Delete the old image
            Storage::delete('public/' . $enemy->image_path);
            
            // Store the new image
            $imagePath = $request->file('image')->store('public/enemies');
            $data['image_path'] = str_replace('public/', '', $imagePath);
        }
        
        $enemy->update($data);
        
        return response()->json($enemy);
    }
    
    public function destroy(Enemy $enemy)
    {
        // Delete the enemy image
        Storage::delete('public/' . $enemy->image_path);
        
        // Delete the enemy
        $enemy->delete();
        
        return response()->json(null, 204);
    }
}