<?php

/**
 * Wait until Laravel can connect to MySQL (Railway private network can take time).
 * Usage: php scripts/wait-for-db.php
 */
declare(strict_types=1);

require __DIR__.'/../vendor/autoload.php';

$app = require __DIR__.'/../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$connection = config('database.default');
$config = config("database.connections.{$connection}", []);
$host = (string) ($config['host'] ?? 'unknown');
$port = (string) ($config['port'] ?? 'unknown');
$database = (string) ($config['database'] ?? 'unknown');
$url = (string) ($config['url'] ?? '');

if ($url !== '') {
    echo "[wait-for-db] connection={$connection} url=".preg_replace('/:[^:@]+@/', ':***@', $url)."\n";
} else {
    echo "[wait-for-db] connection={$connection} host={$host} port={$port} database={$database}\n";
}

if (in_array($host, ['127.0.0.1', 'localhost'], true) && $url === '') {
    fwrite(STDERR, "[wait-for-db] ERROR: host is {$host}. Link MySQL with DB_URL=\${{MySQL.MYSQL_URL}} on the backend service.\n");
    exit(1);
}

$maxAttempts = (int) (getenv('DB_WAIT_ATTEMPTS') ?: 30);

for ($attempt = 1; $attempt <= $maxAttempts; $attempt++) {
    try {
        Illuminate\Support\Facades\DB::connection()->getPdo();
        echo "[wait-for-db] ready (attempt {$attempt})\n";
        exit(0);
    } catch (Throwable $e) {
        echo "[wait-for-db] attempt {$attempt}/{$maxAttempts}: {$e->getMessage()}\n";
        if ($attempt < $maxAttempts) {
            sleep(2);
        }
    }
}

fwrite(STDERR, "[wait-for-db] gave up after {$maxAttempts} attempts\n");
exit(1);
