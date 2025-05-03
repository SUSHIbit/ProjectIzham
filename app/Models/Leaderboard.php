<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Leaderboard extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'highest_level',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}