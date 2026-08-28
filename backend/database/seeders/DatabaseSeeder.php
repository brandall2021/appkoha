<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $this->call([
            CareerSeeder::class,
            StudentSeeder::class,
            SubjectSeeder::class,
            ScheduleSeeder::class,
            CorrelativitySeeder::class,
            NewsSeeder::class,
            LinksUtilesSeeder::class,
        ]);
    }
}
