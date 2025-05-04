<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Player;
use App\Models\Leaderboard;
use App\Models\Enemy;
use App\Models\Question;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'mimin@gmail.com',
            'password' => Hash::make('123456789'),
            'role' => 'admin',
        ]);

        // Create test player users
        $player1 = User::create([
            'name' => 'Sushi Maru',
            'email' => 'ariefsushi1@gmail.com',
            'password' => Hash::make('123456789'),
            'role' => 'player',
        ]);

        $player2 = User::create([
            'name' => 'IMRAN',
            'email' => 'imran@gmail.com',
            'password' => Hash::make('123456789'),
            'role' => 'player',
        ]);

        // Create player profiles
        $playerProfile1 = Player::create([
            'user_id' => $player1->id,
            'character_name' => 'Sushi Maru',
            'level' => 11,
            'hp' => 100,
            'actual_hp' => 100,
            'defense' => 15,
            'min_attack' => 30,
            'max_attack' => 35,
            'heal_value' => 30,
            'upgrades_used' => 2,
        ]);

        $playerProfile2 = Player::create([
            'user_id' => $player2->id,
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

        // Create leaderboard entries
        Leaderboard::create([
            'player_id' => $playerProfile1->id,
            'highest_level' => 11,
        ]);

        Leaderboard::create([
            'player_id' => $playerProfile2->id,
            'highest_level' => 1,
        ]);

        // Create test enemies
        $enemy1 = Enemy::create([
            'name' => 'Goblin',
            'hp' => 50,
            'min_attack' => 5,
            'max_attack' => 10,
            'defense' => 3,
            'image_path' => 'enemies/goblin.jpg',
            'min_level' => 1,
            'max_level' => 5,
            'in_game_level' => 1,
        ]);

        $enemy2 = Enemy::create([
            'name' => 'Orc',
            'hp' => 100,
            'min_attack' => 10,
            'max_attack' => 15,
            'defense' => 5,
            'image_path' => 'enemies/orc.jpg',
            'min_level' => 3,
            'max_level' => 8,
            'in_game_level' => 3,
        ]);

        $enemy3 = Enemy::create([
            'name' => 'Dragon',
            'hp' => 200,
            'min_attack' => 15,
            'max_attack' => 25,
            'defense' => 10,
            'image_path' => 'enemies/dragon.jpg',
            'min_level' => 8,
            'max_level' => 15,
            'in_game_level' => 8,
        ]);

        // Create test questions
        Question::create([
            'enemy_id' => $enemy1->id,
            'question_text' => 'What is the capital of France?',
            'option_a' => 'London',
            'option_b' => 'Berlin',
            'option_c' => 'Paris',
            'option_d' => 'Madrid',
            'correct_answer' => 'C',
        ]);

        Question::create([
            'enemy_id' => $enemy1->id,
            'question_text' => 'Which planet is known as the Red Planet?',
            'option_a' => 'Venus',
            'option_b' => 'Mars',
            'option_c' => 'Jupiter',
            'option_d' => 'Saturn',
            'correct_answer' => 'B',
        ]);

        Question::create([
            'enemy_id' => $enemy2->id,
            'question_text' => 'What is the largest ocean on Earth?',
            'option_a' => 'Atlantic Ocean',
            'option_b' => 'Indian Ocean',
            'option_c' => 'Arctic Ocean',
            'option_d' => 'Pacific Ocean',
            'correct_answer' => 'D',
        ]);

        Question::create([
            'enemy_id' => $enemy3->id,
            'question_text' => 'Who painted the Mona Lisa?',
            'option_a' => 'Vincent van Gogh',
            'option_b' => 'Leonardo da Vinci',
            'option_c' => 'Pablo Picasso',
            'option_d' => 'Michelangelo',
            'correct_answer' => 'B',
        ]);
    }
}