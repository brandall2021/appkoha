<?php

namespace Database\Seeders;

use App\Models\Correlativity;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class CorrelativitySeeder extends Seeder
{
    public function run(): void
    {
        $pairs = [
            ['subject' => 'ADM102', 'required' => 'ADM101'],
            ['subject' => 'EST101', 'required' => 'MAT101'],
            ['subject' => 'ADM201', 'required' => 'ADM101'],
        ];

        foreach ($pairs as $pair) {
            $subject = Subject::where('code', $pair['subject'])->first();
            $required = Subject::where('code', $pair['required'])->first();
            Correlativity::insert([
                'subject_id'         => $subject->id,
                'required_subject_id' => $required->id,
                'created_at'         => now(),
                'updated_at'         => now(),
            ]);
        }
    }
}
