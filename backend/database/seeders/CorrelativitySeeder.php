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
            ['subject' => 'ADM201', 'required' => 'ECO101'],
            ['subject' => 'CON201', 'required' => 'ADM102'],
            ['subject' => 'CON202', 'required' => 'CON201'],
            ['subject' => 'FIS201', 'required' => 'CON201'],
            ['subject' => 'DER201', 'required' => 'DER101'],
            ['subject' => 'AUD201', 'required' => 'CON201'],
            ['subject' => 'AUD201', 'required' => 'CON202'],
            ['subject' => 'MAT201', 'required' => 'MAT101'],
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
