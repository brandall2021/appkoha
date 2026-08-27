<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model
{
    protected $fillable = ['code', 'name', 'career_id', 'year', 'semester'];

    protected $casts = [
        'year' => 'integer',
        'semester' => 'integer',
    ];

    public function career(): BelongsTo
    {
        return $this->belongsTo(Career::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function requiredBy(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'correlativities', 'required_subject_id', 'subject_id');
    }

    public function requires(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'correlativities', 'subject_id', 'required_subject_id');
    }
}
