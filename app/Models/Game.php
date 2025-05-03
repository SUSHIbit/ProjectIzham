<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Game extends Model
{
    use HasFactory;

    protected $fillable = [
        'player_id',
        'highest_level_reached',
    ];

    public function player()
    {
        return $this->belongsTo(Player::class);
    }
}
