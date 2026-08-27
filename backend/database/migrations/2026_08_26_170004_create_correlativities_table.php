<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('correlativities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects');
            $table->foreignId('required_subject_id')->constrained('subjects');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('correlativities');
    }
};
