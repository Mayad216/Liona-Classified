<?php

return [
    'openai_api_key' => env('OPENAI_API_KEY'),
    'openai_model' => env('OPENAI_MODEL', 'gpt-4o-mini'),
    'ai_daily_limit' => (int) env('RESUME_AI_DAILY_LIMIT', 20),
    'free_watermark' => env('RESUME_FREE_WATERMARK', true),
    'autocomplete' => require __DIR__.'/resume_autocomplete.php',
];
