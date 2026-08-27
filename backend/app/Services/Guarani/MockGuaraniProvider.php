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

    private const SUBJECTS = [
        10001 => [
            ['materia_codigo' => 'ADM101', 'materia_nombre' => 'Introducción a la Administración', 'correlativas' => []],
            ['materia_codigo' => 'ADM102', 'materia_nombre' => 'Contabilidad I',                 'correlativas' => ['ADM101']],
            ['materia_codigo' => 'DER101', 'materia_nombre' => 'Derecho Empresarial',            'correlativas' => []],
            ['materia_codigo' => 'ECO101', 'materia_nombre' => 'Economía General',               'correlativas' => []],
            ['materia_codigo' => 'MAT101', 'materia_nombre' => 'Matemática Aplicada',            'correlativas' => []],
            ['materia_codigo' => 'EST101', 'materia_nombre' => 'Estadística',                     'correlativas' => ['MAT101']],
            ['materia_codigo' => 'ADM201', 'materia_nombre' => 'Administración General',         'correlativas' => ['ADM101', 'ECO101']],
            ['materia_codigo' => 'CON201', 'materia_nombre' => 'Contabilidad II',                 'correlativas' => ['ADM102']],
        ],
        10002 => [
            ['materia_codigo' => 'CON201', 'materia_nombre' => 'Contabilidad II',                 'correlativas' => ['ADM102']],
            ['materia_codigo' => 'CON202', 'materia_nombre' => 'Costos y Presupuestos',           'correlativas' => ['CON201']],
            ['materia_codigo' => 'FIS201', 'materia_nombre' => 'Finanzas Públicas',               'correlativas' => ['CON201']],
            ['materia_codigo' => 'DER201', 'materia_nombre' => 'Derecho Tributario',              'correlativas' => ['DER101']],
            ['materia_codigo' => 'AUD201', 'materia_nombre' => 'Auditoría',                       'correlativas' => ['CON201', 'CON202']],
            ['materia_codigo' => 'MAT201', 'materia_nombre' => 'Matemática Financiera',           'correlativas' => ['MAT101']],
        ],
        10003 => [
            ['materia_codigo' => 'ADM101', 'materia_nombre' => 'Introducción a la Administración', 'correlativas' => []],
            ['materia_codigo' => 'DER101', 'materia_nombre' => 'Derecho Empresarial',             'correlativas' => []],
            ['materia_codigo' => 'ECO101', 'materia_nombre' => 'Economía General',                'correlativas' => []],
            ['materia_codigo' => 'MAT101', 'materia_nombre' => 'Matemática Aplicada',             'correlativas' => []],
            ['materia_codigo' => 'ADM102', 'materia_nombre' => 'Contabilidad I',                  'correlativas' => ['ADM101']],
        ],
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

    public function getSubjects(int $padron): array
    {
        $this->findStudentByPadron($padron);

        return self::SUBJECTS[$padron] ?? [];
    }

    public function getCorrelativities(int $padron): array
    {
        $this->findStudentByPadron($padron);

        $subjects = self::SUBJECTS[$padron] ?? [];
        $approved = array_column($this->getGrades($padron), 'materia_codigo');

        return array_map(function (array $subject) use ($approved): array {
            $correlativas = $subject['correlativas'];
            $aprobada = in_array($subject['materia_codigo'], $approved, true);
            $habilitada = empty($correlativas) || array_reduce($correlativas, function (bool $carry, string $code) use ($approved): bool {
                return $carry && in_array($code, $approved, true);
            }, true);

            return [
                'materia_codigo'  => $subject['materia_codigo'],
                'materia_nombre'  => $subject['materia_nombre'],
                'correlativas'    => $correlativas,
                'aprobada'        => $aprobada,
                'habilitada'      => $habilitada,
            ];
        }, $subjects);
    }
}
