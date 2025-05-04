<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Enemy extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'hp',
        'min_attack',
        'max_attack',
        'defense',
        'image_path',
        'min_level',
        'max_level',
        'question_shuffle_order',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}