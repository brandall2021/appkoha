<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('padron')->unique();
            $table->string('name');
            $table->string('email')->unique();
            $table->foreignId('career_id')->constrained('careers');
            $table->unsignedSmallInteger('enrollment_year');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('students');
    }
};
