<?php

namespace App\Services\Guarani;

interface GuaraniProvider
{
    /**
     * Buscar estudiante por número de padrón.
     *
     * @return array{id: int, padron: int, nombre: string, carrera: string, estado: string}
     *
     * @throws \App\Services\Guarani\StudentNotFoundException
     */
    public function findStudentByPadron(int $padron): array;

    /**
     * Horarios del estudiante para el cuatrimestre actual.
     *
     * @return list<array{materia_codigo: string, materia_nombre: string, dia: string, hora_inicio: string, hora_fin: string, aula: string}>
     */
    public function getSchedule(int $padron): array;

    /**
     * Materias aprobadas del estudiante.
     *
     * @return list<array{materia_codigo: string, materia_nombre: string, nota: float, fecha: string}>
     */
    public function getGrades(int $padron): array;

    /**
     * ¿El estudiante está regular (al día en cuotas y sin deudas)?
     */
    public function isEnrollmentCurrent(int $padron): bool;
}
