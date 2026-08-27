<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Correlativity extends Model
{
    protected $fillable = ['subject_id', 'required_subject_id'];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function requiredSubject(): BelongsTo
    {
        return $this->belongsTo(Subject::class, 'required_subject_id');
    }
}
