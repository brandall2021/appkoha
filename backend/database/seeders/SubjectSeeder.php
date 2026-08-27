<?php

namespace Database\Seeders;

use App\Models\Subject;
use Illuminate\Database\Seeder;

class SubjectSeeder extends Seeder
{
    public function run(): void
    {
        $admCareer = \App\Models\Career::where('code', 'ADM')->first();
        $conCareer = \App\Models\Career::where('code', 'CON')->first();

        Subject::insert([
            // Carrera: Administración — 1er año
            ['code' => 'ADM101', 'name' => 'Introducción a la Administración', 'career_id' => $admCareer->id, 'year' => 1, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ADM102', 'name' => 'Contabilidad I',                 'career_id' => $admCareer->id, 'year' => 1, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'DER101', 'name' => 'Derecho Empresarial',            'career_id' => $admCareer->id, 'year' => 1, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ECO101', 'name' => 'Economía General',               'career_id' => $admCareer->id, 'year' => 1, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'MAT101', 'name' => 'Matemática Aplicada',            'career_id' => $admCareer->id, 'year' => 1, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'EST101', 'name' => 'Estadística',                     'career_id' => $admCareer->id, 'year' => 1, 'semester' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['code' => 'ADM201', 'name' => 'Administración General',         'career_id' => $admCareer->id, 'year' => 2, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
            // Carrera: Contador Público
            ['code' => 'CON201', 'name' => 'Contabilidad II',                 'career_id' => $conCareer->id, 'year' => 2, 'semester' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
