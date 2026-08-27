<?php

namespace Database\Seeders;

use App\Models\News;
use Illuminate\Database\Seeder;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        News::insert([
            [
                'title'        => 'Inscripción al 2do Cuatrimestre 2026',
                'summary'      => 'Abierta la inscripción para el segundo cuatrimestre del año 2026.',
                'body'         => 'La universidad informa que la inscripción para el segundo cuatrimestre del año 2026 se encuentra abierta desde el 1 de agosto hasta el 15 de agosto. Los alumnos deben completar el formulario online y presentar la documentación requerida en la sede central.',
                'image_url'    => null,
                'published_at' => now()->subDays(5),
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'title'        => 'Resultados del Examen de Ingreso',
                'summary'      => 'Publicados los resultados del examen de ingreso de agosto 2026.',
                'body'         => 'Se publicaron los resultados del examen de ingreso correspondiente al ciclo lectivo 2026. Los aspirantes aprobados deberán completar el proceso de matriculación en los próximos 10 días hábiles.',
                'image_url'    => null,
                'published_at' => now()->subDays(2),
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
            [
                'title'        => 'Becas disponibles para el próximo ciclo',
                'summary'      => 'Se abren convocatorias para becas de excelencia académica.',
                'body'         => 'La dirección de bienestar estudiantil anuncia la apertura de convocatorias para becas de excelencia académica destinadas a estudiantes de primer y segundo año. Los interesados deben presentar su postulación antes del 30 de septiembre.',
                'image_url'    => null,
                'published_at' => now(),
                'created_at'   => now(),
                'updated_at'   => now(),
            ],
        ]);
    }
}
