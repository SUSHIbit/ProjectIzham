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
        Schema::table('enemies', function (Blueprint $table) {
            $table->integer('min_level')->default(1)->after('defense');
            $table->integer('max_level')->default(10)->after('min_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('enemies', function (Blueprint $table) {
            $table->dropColumn(['min_level', 'max_level']);
        });
    }
};