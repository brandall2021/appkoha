<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\LinkUtilResource;
use App\Models\LinkUtil;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class LinksUtilesController
{
    public function index(): AnonymousResourceCollection
    {
        $links = LinkUtil::orderByDesc('destacado')
            ->orderBy('orden')
            ->get();

        return LinkUtilResource::collection($links);
    }
}
