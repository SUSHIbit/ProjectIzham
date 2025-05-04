<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Player extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'character_name',
        'level',
        'hp',
        'actual_hp',
        'defense',
        'min_attack',
        'max_attack',
        'heal_value',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function leaderboard()
    {
        return $this->hasOne(Leaderboard::class);
    }

    public function games()
    {
        return $this->hasMany(Game::class);
    }
}