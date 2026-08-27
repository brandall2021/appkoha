<?php

namespace App\Services\Guarani;

class StudentNotFoundException extends \RuntimeException
{
    public function __construct(int $padron)
    {
        parent::__construct("Estudiante con padrón {$padron} no encontrado en Guaraní.");
    }
}
