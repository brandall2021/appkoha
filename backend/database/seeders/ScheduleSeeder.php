<?php

namespace Database\Seeders;

use App\Models\Schedule;
use App\Models\Subject;
use Illuminate\Database\Seeder;

class ScheduleSeeder extends Seeder
{
    public function run(): void
    {
        $dayMap = ['Lunes' => 0, 'Martes' => 1, 'Miércoles' => 2, 'Jueves' => 3, 'Viernes' => 4];

        $schedules = [
            ['code' => 'ADM101', 'day' => $dayMap['Lunes'],     'start' => '08:00', 'end' => '10:00', 'classroom' => 'A101'],
            ['code' => 'ADM102', 'day' => $dayMap['Miércoles'], 'start' => '08:00', 'end' => '10:00', 'classroom' => 'A102'],
            ['code' => 'DER101', 'day' => $dayMap['Viernes'],   'start' => '08:00', 'end' => '10:00', 'classroom' => 'B201'],
            ['code' => 'ECO101', 'day' => $dayMap['Lunes'],     'start' => '10:30', 'end' => '12:30', 'classroom' => 'C301'],
            ['code' => 'MAT101', 'day' => $dayMap['Miércoles'], 'start' => '10:30', 'end' => '12:30', 'classroom' => 'C302'],
            ['code' => 'EST101', 'day' => $dayMap['Viernes'],   'start' => '10:30', 'end' => '12:30', 'classroom' => 'C303'],
            ['code' => 'CON201', 'day' => $dayMap['Lunes'],     'start' => '08:00', 'end' => '10:00', 'classroom' => 'D401'],
        ];

        foreach ($schedules as $s) {
            $subject = Subject::where('code', $s['code'])->first();
            Schedule::insert([
                'subject_id' => $subject->id,
                'day'        => $s['day'],
                'start_time' => $s['start'],
                'end_time'   => $s['end'],
                'classroom'  => $s['classroom'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }
}
