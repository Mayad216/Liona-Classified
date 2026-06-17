<?php

namespace Database\Factories;

use App\Models\Job;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        return [
            'employer_id' => User::factory(),
            'title' => $this->faker->randomElement([
                'Senior Product Designer',
                'Backend Engineer',
                'Marketing Executive',
                'Sales Manager',
                'HR Partner',
            ]),
            'company' => $this->faker->company(),
            'company_logo' => null,
            'description' => $this->faker->paragraph(5),
            'responsibilities' => $this->faker->sentences(4),
            'requirements' => $this->faker->sentences(4),
            'benefits' => ['Visa', 'Health insurance', 'Annual flights', 'Bonus'],
            'emirate' => $this->faker->randomElement(['Dubai', 'Abu Dhabi', 'Sharjah']),
            'area' => $this->faker->randomElement(['Media City', 'DIFC', 'Internet City', 'Business Bay']),
            'industry' => $this->faker->randomElement(['Tech', 'Finance', 'Marketing', 'Real Estate']),
            'employment_type' => $this->faker->randomElement(['Full-time', 'Part-time', 'Freelance', 'Contract']),
            'experience_level' => $this->faker->randomElement(['Entry', 'Mid', 'Senior', 'Lead']),
            'salary_min' => $this->faker->numberBetween(5000, 25000),
            'salary_max' => $this->faker->numberBetween(25000, 60000),
            'remote' => $this->faker->boolean(30),
            'is_featured' => $this->faker->boolean(15),
            'status' => 'active',
        ];
    }
}
