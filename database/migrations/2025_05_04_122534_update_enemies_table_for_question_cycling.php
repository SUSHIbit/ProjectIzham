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
            $table->text('question_shuffle_order')->nullable()->after('max_level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down()
    {
        Schema::table('enemies', function (Blueprint $table) {
            $table->dropColumn('question_shuffle_order');
        });
    }
};