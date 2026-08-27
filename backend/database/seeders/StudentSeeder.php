<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder
{
    public function run(): void
    {
        $admCareer = \App\Models\Career::where('code', 'ADM')->first();
        $conCareer = \App\Models\Career::where('code', 'CON')->first();

        Student::insert([
            ['padron' => 10001, 'name' => 'Juan Perez',   'email' => 'juan.perez@uni.edu.ar',   'career_id' => $admCareer->id, 'enrollment_year' => 2023, 'created_at' => now(), 'updated_at' => now()],
            ['padron' => 10002, 'name' => 'Ana Gomez',    'email' => 'ana.gomez@uni.edu.ar',    'career_id' => $conCareer->id, 'enrollment_year' => 2023, 'created_at' => now(), 'updated_at' => now()],
            ['padron' => 10003, 'name' => 'Carlos Lopez', 'email' => 'carlos.lopez@uni.edu.ar', 'career_id' => $admCareer->id, 'enrollment_year' => 2024, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
