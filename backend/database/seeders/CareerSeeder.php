<?php

namespace Database\Seeders;

use App\Models\Career;
use Illuminate\Database\Seeder;

class CareerSeeder extends Seeder
{
    public function run(): void
    {
        Career::insert([
            ['name' => 'Administración', 'code' => 'ADM', 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Contador Público', 'code' => 'CON', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
