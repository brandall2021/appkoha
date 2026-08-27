<?php

namespace App\Services\Guarani;

class MockGuaraniProvider implements GuaraniProvider
{
    private const STUDENTS = [
        10001 => [
            'id'       => 1,
            'padron'   => 10001,
            'nombre'   => 'Juan Perez',
            'carrera'  => 'Administración',
            'estado'   => 'regular',
        ],
        10002 => [
            'id'       => 2,
            'padron'   => 10002,
            'nombre'   => 'Ana Gomez',
            'carrera'  => 'Contador Público',
            'estado'   => 'regular',
        ],
        10003 => [
            'id'       => 3,
            'padron'   => 10003,
            'nombre'   => 'Carlos Lopez',
            'carrera'  => 'Administración',
            'estado'   => 'regular',
        ],
    ];

    private const SCHEDULE = [
        10001 => [
            ['materia_codigo' => 'ADM101', 'materia_nombre' => 'Introducción a la Administración', 'dia' => 'Lunes',     'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'A101'],
            ['materia_codigo' => 'ADM102', 'materia_nombre' => 'Contabilidad I',                 'dia' => 'Miércoles', 'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'A102'],
            ['materia_codigo' => 'DER101', 'materia_nombre' => 'Derecho Empresarial',            'dia' => 'Viernes',   'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'B201'],
            ['materia_codigo' => 'ECO101', 'materia_nombre' => 'Economía General',               'dia' => 'Lunes',     'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'C301'],
            ['materia_codigo' => 'MAT101', 'materia_nombre' => 'Matemática Aplicada',            'dia' => 'Miércoles', 'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'C302'],
            ['materia_codigo' => 'EST101', 'materia_nombre' => 'Estadística',                     'dia' => 'Viernes',   'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'C303'],
        ],
        10002 => [
            ['materia_codigo' => 'CON201', 'materia_nombre' => 'Contabilidad II',                 'dia' => 'Lunes',     'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'D401'],
            ['materia_codigo' => 'CON202', 'materia_nombre' => 'Costos y Presupuestos',           'dia' => 'Miércoles', 'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'D402'],
            ['materia_codigo' => 'FIS201', 'materia_nombre' => 'Finanzas Públicas',               'dia' => 'Viernes',   'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'E501'],
            ['materia_codigo' => 'DER201', 'materia_nombre' => 'Derecho Tributario',              'dia' => 'Lunes',     'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'E502'],
            ['materia_codigo' => 'AUD201', 'materia_nombre' => 'Auditoría',                       'dia' => 'Miércoles', 'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'E503'],
            ['materia_codigo' => 'MAT201', 'materia_nombre' => 'Matemática Financiera',           'dia' => 'Viernes',   'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'F601'],
        ],
        10003 => [
            ['materia_codigo' => 'ADM101', 'materia_nombre' => 'Introducción a la Administración', 'dia' => 'Lunes',     'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'A101'],
            ['materia_codigo' => 'DER101', 'materia_nombre' => 'Derecho Empresarial',             'dia' => 'Miércoles', 'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'B201'],
            ['materia_codigo' => 'ECO101', 'materia_nombre' => 'Economía General',                'dia' => 'Viernes',   'hora_inicio' => '08:00', 'hora_fin' => '10:00', 'aula' => 'C301'],
            ['materia_codigo' => 'MAT101', 'materia_nombre' => 'Matemática Aplicada',             'dia' => 'Viernes',   'hora_inicio' => '10:30', 'hora_fin' => '12:30', 'aula' => 'C303'],
        ],
    ];

    private const GRADES = [
        10001 => [],
        10002 => [],
        10003 => [
            ['materia_codigo' => 'ADM101', 'materia_nombre' => 'Introducción a la Administración', 'nota' => 8.5, 'fecha' => '2025-12-15'],
        ],
    ];

    private const ENROLLMENT_STATUS = [
        10001 => true,
        10002 => true,
        10003 => true,
    ];

    public function findStudentByPadron(int $padron): array
    {
        if (! isset(self::STUDENTS[$padron])) {
            throw new StudentNotFoundException($padron);
        }

        return self::STUDENTS[$padron];
    }

    public function getSchedule(int $padron): array
    {
        $this->findStudentByPadron($padron);

        return self::SCHEDULE[$padron] ?? [];
    }

    public function getGrades(int $padron): array
    {
        $this->findStudentByPadron($padron);

        return self::GRADES[$padron] ?? [];
    }

    public function isEnrollmentCurrent(int $padron): bool
    {
        $this->findStudentByPadron($padron);

        return self::ENROLLMENT_STATUS[$padron] ?? false;
    }
}
