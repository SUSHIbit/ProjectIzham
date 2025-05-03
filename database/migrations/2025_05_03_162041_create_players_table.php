<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::create('players', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('character_name')->default('Adventurer');
            $table->integer('level')->default(1);
            $table->integer('hp')->default(100);
            $table->integer('defense')->default(5);
            $table->integer('min_attack')->default(10);
            $table->integer('max_attack')->default(15);
            $table->integer('heal_value')->default(20);
            $table->timestamps();
        });
    }
    
    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('players');
    }
};
