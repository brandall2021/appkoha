<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LinkUtil extends Model
{
    protected $table = 'links_utiles';

    protected $fillable = ['titulo', 'url', 'icono', 'orden', 'destacado'];

    protected $casts = [
        'orden' => 'integer',
        'destacado' => 'boolean',
    ];
}
