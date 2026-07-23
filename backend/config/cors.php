<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => array_values(array_filter(array_unique([
        env('FRONTEND_URL', 'http://localhost:5173'),
    ]))),
    'allowed_origins_patterns' => array_values(array_filter([
        env('CORS_ORIGIN_PATTERN'),
        '#^https://.*\\.up\\.railway\\.app$#',
    ])),
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];
