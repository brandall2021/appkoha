<?php

namespace Database\Seeders;

use App\Models\LinkUtil;
use Illuminate\Database\Seeder;

class LinksUtilesSeeder extends Seeder
{
    public function run(): void
    {
        LinkUtil::insert([
            [
                'titulo'     => 'Sistema Guaraní',
                'url'        => 'https://guarani.face.unt.edu.ar',
                'icono'      => 'school',
                'orden'      => 1,
                'destacado'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo'     => 'Biblioteca FACET',
                'url'        => 'https://biblio.face.unt.edu.ar',
                'icono'      => 'bookshelf',
                'orden'      => 2,
                'destacado'  => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo'     => 'Web institucional',
                'url'        => 'https://www.face.unt.edu.ar',
                'icono'      => 'web',
                'orden'      => 3,
                'destacado'  => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'titulo'     => 'Email institucional',
                'url'        => 'https://mail.face.unt.edu.ar',
                'icono'      => 'email',
                'orden'      => 4,
                'destacado'  => false,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
