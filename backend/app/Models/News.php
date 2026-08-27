<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class News extends Model
{
    protected $fillable = ['title', 'summary', 'body', 'image_url', 'published_at'];

    protected $casts = [
        'published_at' => 'datetime',
    ];
}
