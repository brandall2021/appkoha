<?php

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class SeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeders_create_expected_counts(): void
    {
        $this->artisan('db:seed');

        $this->assertDatabaseCount('careers', 2);
        $this->assertDatabaseCount('students', 3);
        $this->assertDatabaseCount('subjects', 13);
        $this->assertDatabaseCount('schedules', 12);
        $this->assertDatabaseCount('correlativities', 11);
        $this->assertDatabaseCount('news', 3);
    }
}
