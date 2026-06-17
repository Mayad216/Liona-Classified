<?php

namespace Database\Seeders;

use App\Services\UaeLocationImportService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class UaeLocationSeeder extends Seeder
{
    public function run(UaeLocationImportService $importer): void
    {
        $candidates = [
            database_path('data/uae-locations.json'),
            database_path('data/dubizzle-locations.json'),
        ];

        foreach ($candidates as $path) {
            if (! File::exists($path)) {
                continue;
            }

            $payload = json_decode(File::get($path), true);
            if (is_array($payload)) {
                $importer->importFromJson($payload);
            }

            return;
        }
    }
}
