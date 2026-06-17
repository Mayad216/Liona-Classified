<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => '+9715' . $this->faker->numerify('########'),
            'password' => Hash::make('password'),
            'role' => 'lister',
            'avatar' => 'https://i.pravatar.cc/300?u=' . $this->faker->uuid(),
            'is_verified' => $this->faker->boolean(80),
            'rating' => $this->faker->randomFloat(1, 4, 5),
        ];
    }

    public function admin(): self
    {
        return $this->state(fn () => ['role' => 'admin']);
    }
}
