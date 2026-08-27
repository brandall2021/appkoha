<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\NewsResource;
use App\Models\News;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NewsController
{
    public function index(): AnonymousResourceCollection
    {
        $news = News::whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->get();

        return NewsResource::collection($news);
    }

    public function show(int $id): NewsResource|JsonResponse
    {
        $news = News::where('id', $id)->whereNotNull('published_at')->first();

        if (! $news) {
            return response()->json(['message' => 'Novedad no encontrada.'], 404);
        }

        return new NewsResource($news);
    }
}
