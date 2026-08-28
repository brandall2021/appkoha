<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class LinkUtilResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'url' => $this->url,
            'icono' => $this->icono,
            'orden' => $this->orden,
            'destacado' => $this->destacado,
        ];
    }
}
