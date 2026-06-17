<?php

namespace App\Console\Commands;

use App\Services\UaeLocationImportService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ImportUaeLocationsCommand extends Command
{
    protected $signature = 'locations:import {file? : Path to dubizzle-locations.json or uae-locations.json}';

    protected $description = 'Import UAE emirates and neighborhoods from a Dubizzle/location JSON export';

    public function handle(UaeLocationImportService $importer): int
    {
        $path = $this->argument('file')
            ?? database_path('data/uae-locations.json');

        if (! File::exists($path)) {
            $this->error("File not found: {$path}");
            $this->line('Run: node scripts/fetch-dubizzle-locations-realtyapi.mjs');
            $this->line('Or:  node scripts/fetch-uae-locations-propertyfinder.mjs');

            return self::FAILURE;
        }

        $payload = json_decode(File::get($path), true);
        if (! is_array($payload)) {
            $this->error('Invalid JSON file.');

            return self::FAILURE;
        }

        $stats = $importer->importFromJson($payload);

        $this->info("Imported {$stats['neighborhoods']} neighborhoods across {$stats['emirates']} emirates.");
        $this->line("Created: {$stats['created']} · Updated: {$stats['updated']}");

        return self::SUCCESS;
    }
}
