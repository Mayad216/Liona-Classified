<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ListingFactory extends Factory
{
    public function definition(): array
    {
        $areas = ['Dubai Marina', 'Bur Dubai', 'JLT', 'Downtown Dubai', 'Al Reem Island', 'Al Nahda'];
        $emirates = ['Dubai', 'Abu Dhabi', 'Sharjah'];

        return [
            'host_id' => User::factory(),
            'title' => $this->faker->randomElement([
                'Cosy Bedspace in Dubai Marina',
                'Furnished Studio with Pool View',
                'Private Room — Female Only',
                'Spacious 2BR Family Apartment',
                'Modern Partition in Al Nahda',
            ]),
            'description' => $this->faker->paragraph(4),
            'emirate' => $this->faker->randomElement($emirates),
            'area' => $this->faker->randomElement($areas),
            'price' => $this->faker->numberBetween(1000, 8000),
            'deposit' => $this->faker->numberBetween(500, 5000),
            'room_type' => $this->faker->randomElement([
                'Bedspace', 'Partition', 'Private Room', 'Studio', 'Full Apartment',
            ]),
            'size_sqft' => $this->faker->numberBetween(400, 2000),
            'tenants_count' => $this->faker->numberBetween(1, 4),
            'attached_bathroom' => $this->faker->boolean(),
            'balcony' => $this->faker->boolean(),
            'distance_to_metro_km' => $this->faker->randomFloat(1, 0.1, 5),
            'gender_preference' => $this->faker->randomElement(['Male', 'Female', 'Any', 'Family']),
            'nationality_preference' => $this->faker->randomElement(['Any', 'Indian', 'Filipino', 'Arab']),
            'listed_by' => $this->faker->randomElement(['Tenant', 'Landlord', 'Agent', 'Developer']),
            'amenities' => $this->faker->randomElements(
                ['WiFi', 'AC', 'Parking', 'Gym', 'Pool', 'Housekeeping', 'Furnished'],
                rand(3, 6)
            ),
            'photos' => [
                'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
                'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1200&q=80',
            ],
            'is_featured' => $this->faker->boolean(20),
            'is_published' => true,
            'status' => 'active',
        ];
    }
}
