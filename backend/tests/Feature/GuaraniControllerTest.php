<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GuaraniControllerTest extends TestCase
{
    use RefreshDatabase;

    private function createStudentToken(): string
    {
        $user = User::factory()->create(['role' => 'student']);

        return $user->createToken('auth-token')->plainTextToken;
    }

    private function authHeader(string $token): array
    {
        return ['Authorization' => 'Bearer ' . $token];
    }

    public function test_student_returns_authenticated_student_data(): void
    {
        $token = $this->createStudentToken();

        $response = $this->withHeaders($this->authHeader($token))
            ->getJson('/api/v1/guarani/student');

        $response->assertOk()
            ->assertJsonPath('data.padron', 10001)
            ->assertJsonPath('data.nombre', 'Juan Perez')
            ->assertJsonPath('data.carrera', 'Administración')
            ->assertJsonPath('data.estado', 'regular');
    }

    public function test_student_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/guarani/student');

        $response->assertUnauthorized();
    }

    public function test_student_requires_student_role(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('auth-token')->plainTextToken;

        $response = $this->withHeaders($this->authHeader($token))
            ->getJson('/api/v1/guarani/student');

        $response->assertStatus(403);
    }

    public function test_subjects_returns_correlatividades(): void
    {
        $token = $this->createStudentToken();

        $response = $this->withHeaders($this->authHeader($token))
            ->getJson('/api/v1/guarani/subjects');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['materia_codigo', 'materia_nombre', 'correlativas'],
                ],
            ]);

        $this->assertGreaterThanOrEqual(1, count($response->json('data')));
    }

    public function test_schedule_returns_weekly_schedule(): void
    {
        $token = $this->createStudentToken();

        $response = $this->withHeaders($this->authHeader($token))
            ->getJson('/api/v1/guarani/schedule');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['materia_codigo', 'materia_nombre', 'dia', 'hora_inicio', 'hora_fin', 'aula'],
                ],
            ]);

        $this->assertCount(6, $response->json('data'));
    }

    public function test_correlativities_returns_visual_status(): void
    {
        $token = $this->createStudentToken();

        $response = $this->withHeaders($this->authHeader($token))
            ->getJson('/api/v1/guarani/correlativities');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['materia_codigo', 'materia_nombre', 'correlativas', 'aprobada', 'habilitada'],
                ],
            ]);

        $data = $response->json('data');
        $adm101 = collect($data)->firstWhere('materia_codigo', 'ADM101');
        $this->assertFalse($adm101['aprobada']);
        $this->assertTrue($adm101['habilitada']);

        $adm102 = collect($data)->firstWhere('materia_codigo', 'ADM102');
        $this->assertFalse($adm102['aprobada']);
        $this->assertFalse($adm102['habilitada']);
    }

    public function test_all_guarani_endpoints_require_student_role(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $token = $user->createToken('auth-token')->plainTextToken;
        $headers = $this->authHeader($token);

        $this->withHeaders($headers)->getJson('/api/v1/guarani/student')->assertStatus(403);
        $this->withHeaders($headers)->getJson('/api/v1/guarani/subjects')->assertStatus(403);
        $this->withHeaders($headers)->getJson('/api/v1/guarani/schedule')->assertStatus(403);
        $this->withHeaders($headers)->getJson('/api/v1/guarani/correlativities')->assertStatus(403);
    }
}
