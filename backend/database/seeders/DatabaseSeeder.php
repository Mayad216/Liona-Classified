<?php

namespace Database\Seeders;

use App\Models\Job;
use App\Models\Listing;
use App\Models\Service;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Demo admin
        User::factory()->admin()->create([
            'name' => 'Admin',
            'email' => 'admin@khaleej.ae',
            'password' => Hash::make('password'),
        ]);

        // Demo user
        $aisha = User::factory()->create([
            'name' => 'Aisha Al Marri',
            'email' => 'aisha@khaleej.ae',
            'password' => Hash::make('password'),
            'is_verified' => true,
        ]);

        // 20 random hosts with listings
        User::factory(20)->create()->each(function ($u) {
            Listing::factory(rand(1, 3))->create(['host_id' => $u->id]);
        });

        // 10 employers with jobs
        User::factory(10)->create(['role' => 'employer'])->each(function ($u) {
            Job::factory(rand(1, 3))->create(['employer_id' => $u->id]);
        });

        // 10 service providers
        User::factory(10)->create(['role' => 'service_provider'])->each(function ($u) {
            Service::factory(rand(1, 2))->create(['provider_id' => $u->id]);
        });

        // Featured listings for Aisha
        Listing::factory(2)->create([
            'host_id' => $aisha->id,
            'is_featured' => true,
        ]);

        $this->call(CommunitySeeder::class);
        $this->call(UaeLocationSeeder::class);
        $this->call(CopilotSubscriptionPlanSeeder::class);
        $this->call(CopilotJobSourceSeeder::class);
    }
}
