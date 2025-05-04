<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GameState extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'battle_level',
        'current_enemy_index',
        'current_question_index',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}