<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('links_utiles', function (Blueprint $table) {
            $table->id();
            $table->string('titulo');
            $table->string('url');
            $table->string('icono')->nullable();
            $table->integer('orden')->default(0);
            $table->boolean('destacado')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('links_utiles');
    }
};
