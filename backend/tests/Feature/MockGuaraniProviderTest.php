<?php

use App\Services\Guarani\GuaraniProvider;
use App\Services\Guarani\MockGuaraniProvider;
use App\Services\Guarani\StudentNotFoundException;
use Tests\TestCase;

class MockGuaraniProviderTest extends TestCase
{
    private GuaraniProvider $provider;

    protected function setUp(): void
    {
        parent::setUp();
        $this->provider = new MockGuaraniProvider;
    }

    public function test_find_student_returns_correct_data(): void
    {
        $student = $this->provider->findStudentByPadron(10001);

        $this->assertEquals(10001, $student['padron']);
        $this->assertEquals('Juan Perez', $student['nombre']);
        $this->assertEquals('Administración', $student['carrera']);
        $this->assertEquals('regular', $student['estado']);
    }

    public function test_find_student_throws_for_unknown_padron(): void
    {
        $this->expectException(StudentNotFoundException::class);

        $this->provider->findStudentByPadron(99999);
    }

    public function test_schedule_returns_only_lunes_miercoles_viernes(): void
    {
        $schedule = $this->provider->getSchedule(10001);

        $this->assertCount(6, $schedule);

        $dias = array_unique(array_column($schedule, 'dia'));
        $this->assertEqualsCanonicalizing(['Lunes', 'Miércoles', 'Viernes'], $dias);
    }

    public function test_grades_returns_approved_subjects_for_student_10003(): void
    {
        $grades = $this->provider->getGrades(10003);

        $this->assertCount(1, $grades);
        $this->assertEquals('ADM101', $grades[0]['materia_codigo']);
        $this->assertEquals(8.5, $grades[0]['nota']);
    }

    public function test_is_enrollment_current_returns_true_for_regular_students(): void
    {
        $this->assertTrue($this->provider->isEnrollmentCurrent(10001));
        $this->assertTrue($this->provider->isEnrollmentCurrent(10002));
        $this->assertTrue($this->provider->isEnrollmentCurrent(10003));
    }
}
