<?php

namespace App\Services\Copilot;

use Illuminate\Support\Facades\Http;

abstract class CopilotAiClient
{
    protected function chat(string $system, string $user, bool $json = false, float $temperature = 0.35): ?string
    {
        $key = config('copilot.openai_api_key');
        if (! $key) {
            return null;
        }

        $payload = [
            'model' => config('copilot.openai_model'),
            'temperature' => $temperature,
            'messages' => [
                ['role' => 'system', 'content' => $system],
                ['role' => 'user', 'content' => $user],
            ],
        ];

        if ($json) {
            $payload['response_format'] = ['type' => 'json_object'];
        }

        $response = Http::withToken($key)
            ->timeout(45)
            ->post('https://api.openai.com/v1/chat/completions', $payload);

        if (! $response->successful()) {
            return null;
        }

        return trim($response->json('choices.0.message.content') ?? '');
    }

    protected function renderTemplate(string $template, array $vars): string
    {
        $out = $template;
        foreach ($vars as $key => $value) {
            $out = str_replace('{{'.$key.'}}', (string) $value, $out);
        }

        return $out;
    }

    /**
     * @param  array<string, mixed>|null  $profile
     * @param  array<string, mixed>|null  $resumeData
     */
    protected function profileContext(?array $profile, ?array $resumeData): string
    {
        return json_encode([
            'profile' => $profile,
            'resume' => $resumeData,
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    }
}
