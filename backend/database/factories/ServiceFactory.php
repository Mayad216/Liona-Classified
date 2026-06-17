<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ServiceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'provider_id' => User::factory(),
            'title' => $this->faker->randomElement([
                'Deep Cleaning Service',
                'AC Repair & Maintenance',
                'Movers & Packers',
                'Apartment Repainting',
                'Pest Control',
                'Plumbing Emergency',
            ]),
            'description' => $this->faker->paragraph(3),
            'category' => $this->faker->randomElement([
                'Cleaning', 'AC Repair', 'Moving', 'Plumbing', 'Painting', 'Pest Control',
            ]),
            'price_from' => $this->faker->numberBetween(99, 999),
            'unit' => $this->faker->randomElement(['visit', 'hour', 'unit', '1BR']),
            'emirate' => $this->faker->randomElement(['Dubai', 'Abu Dhabi', 'Sharjah']),
            'photos' => [
                'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1200&q=80',
            ],
            'response_time' => $this->faker->randomElement(['< 30 min', '< 1 hour', '< 2 hours', 'Same day']),
            'completed_jobs' => $this->faker->numberBetween(50, 15000),
            'is_verified' => $this->faker->boolean(80),
            'rating' => $this->faker->randomFloat(1, 4, 5),
            'review_count' => $this->faker->numberBetween(20, 2000),
        ];
    }
}
