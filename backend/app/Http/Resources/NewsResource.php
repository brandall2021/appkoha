<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NewsResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->title,
            'resumen' => $this->summary,
            'cuerpo' => $this->body,
            'imagen_url' => $this->image_url,
            'fecha' => $this->published_at?->toIso8601String(),
        ];
    }
}
