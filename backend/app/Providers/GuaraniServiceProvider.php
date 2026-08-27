<?php

namespace App\Providers;

use App\Services\Guarani\GuaraniProvider;
use App\Services\Guarani\MockGuaraniProvider;
use Illuminate\Support\ServiceProvider;

class GuaraniServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(GuaraniProvider::class, MockGuaraniProvider::class);
    }
}
