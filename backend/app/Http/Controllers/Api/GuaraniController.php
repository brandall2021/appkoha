<?php

namespace App\Http\Controllers\Api;

use App\Services\Guarani\GuaraniProvider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GuaraniController
{
    public function __construct(
        private readonly GuaraniProvider $guarani,
    ) {}

    public function student(Request $request): JsonResponse
    {
        $padron = $this->resolvePadron();

        $student = $this->guarani->findStudentByPadron($padron);

        return response()->json(['data' => $student]);
    }

    public function subjects(Request $request): JsonResponse
    {
        $padron = $this->resolvePadron();

        $subjects = $this->guarani->getSubjects($padron);

        return response()->json(['data' => $subjects]);
    }

    public function schedule(Request $request): JsonResponse
    {
        $padron = $this->resolvePadron();

        $schedule = $this->guarani->getSchedule($padron);

        return response()->json(['data' => $schedule]);
    }

    public function correlativities(Request $request): JsonResponse
    {
        $padron = $this->resolvePadron();

        $correlativities = $this->guarani->getCorrelativities($padron);

        return response()->json(['data' => $correlativities]);
    }

    private function resolvePadron(): int
    {
        // TODO: Task 8 — resolver padron desde profile del usuario autenticado
        return 10001;
    }
}
