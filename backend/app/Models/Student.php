<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model
{
    protected $fillable = ['padron', 'name', 'email', 'career_id', 'enrollment_year'];

    protected $casts = [
        'padron' => 'integer',
        'enrollment_year' => 'integer',
    ];

    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class);
    }
}
