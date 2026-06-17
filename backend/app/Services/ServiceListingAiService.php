<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class ServiceListingAiService
{
    private const SYSTEM = <<<'TXT'
You are a professional copywriter for a trusted UAE services marketplace.
Write clear, trustworthy service descriptions for home services, tutors, meal providers, and trades.
Tone: warm, professional, specific — never generic or salesy.
Do not invent licences, certifications, or guarantees you were not given.
Return plain text only — no markdown, no bullet characters, no JSON.
TXT;

    /**
     * @param  array<string, mixed>  $input
     */
    public function suggestDescription(array $input): string
    {
        $prompt = $this->buildPrompt($input);
        $raw = $this->chat($prompt);

        if ($raw) {
            return trim($raw);
        }

        return $this->fallbackDescription($input);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function buildPrompt(array $input): string
    {
        $lines = [
            'Write a 4–6 sentence service listing description for a UAE classifieds platform.',
            'Use short paragraphs. Mention coverage, pricing, response time, and experience naturally.',
            'Category: '.($input['category'] ?? ''),
            'Title: '.($input['title'] ?? ''),
            'Emirate: '.($input['emirate'] ?? ''),
            'Area: '.($input['area'] ?? ''),
            'Account type: '.($input['account_type'] ?? 'individual'),
        ];

        if (! empty($input['provider_name'])) {
            $lines[] = 'Provider name: '.$input['provider_name'];
        }
        if (! empty($input['price_from'])) {
            $lines[] = 'Price from: AED '.$input['price_from'].' per '.($input['unit'] ?? 'visit');
        }
        if (! empty($input['response_time'])) {
            $lines[] = 'Response time: '.$input['response_time'];
        }
        if (! empty($input['years_experience'])) {
            $lines[] = 'Experience: '.$input['years_experience'];
        }
        if (! empty($input['coverage'])) {
            $lines[] = 'Coverage: '.$input['coverage'];
        }
        if (! empty($input['same_day'])) {
            $lines[] = 'Same-day availability: '.$input['same_day'];
        }
        if (! empty($input['tutoring_languages'])) {
            $lines[] = 'Languages: '.implode(', ', (array) $input['tutoring_languages']);
        }
        if (! empty($input['teaches_levels'])) {
            $lines[] = 'Levels: '.implode(', ', (array) $input['teaches_levels']);
        }
        if (! empty($input['session_format'])) {
            $lines[] = 'Session format: '.$input['session_format'];
        }
        if (! empty($input['meal_cuisines'])) {
            $lines[] = 'Cuisines: '.implode(', ', (array) $input['meal_cuisines']);
        }
        if (! empty($input['dietary_tags'])) {
            $lines[] = 'Dietary tags: '.implode(', ', (array) $input['dietary_tags']);
        }
        if (! empty($input['meal_offering_type'])) {
            $lines[] = 'Meal offering: '.$input['meal_offering_type'];
        }
        if (! empty($input['meal_fulfillment'])) {
            $lines[] = 'Fulfillment: '.$input['meal_fulfillment'];
        }
        if (! empty($input['pest_types'])) {
            $lines[] = 'Pest types: '.implode(', ', (array) $input['pest_types']);
        }

        $lines[] = 'Do not mention Khaleej, AI, or chatbots.';

        return implode("\n", $lines);
    }

    /**
     * @param  array<string, mixed>  $input
     */
    private function fallbackDescription(array $input): string
    {
        $provider = $input['provider_name'] ?? ($input['account_type'] === 'business' ? 'Our team' : 'An experienced provider');
        $area = $input['area'] ?? 'your area';
        $emirate = $input['emirate'] ?? 'the UAE';
        $category = $input['category'] ?? 'service';

        $intro = "{$provider} offers professional {$category} across {$area}, {$emirate}.";

        $details = [];
        if (! empty($input['price_from']) && ! empty($input['unit'])) {
            $details[] = "Pricing starts from AED {$input['price_from']} per {$input['unit']}.";
        }
        if (! empty($input['response_time'])) {
            $details[] = "Typical response time: {$input['response_time']}.";
        }
        if (! empty($input['years_experience'])) {
            $details[] = "Backed by {$input['years_experience']} of practical experience.";
        }
        if (($input['same_day'] ?? '') === 'yes') {
            $details[] = 'Same-day appointments may be available — message to confirm a slot.';
        }

        return trim($intro.' '.implode(' ', $details));
    }

    private function chat(string $prompt): ?string
    {
        $apiKey = config('services.openai.key') ?? env('OPENAI_API_KEY');
        if (! $apiKey) {
            return null;
        }

        try {
            $response = Http::withToken($apiKey)
                ->timeout(45)
                ->post('https://api.openai.com/v1/chat/completions', [
                    'model' => config('services.openai.model', 'gpt-4o-mini'),
                    'messages' => [
                        ['role' => 'system', 'content' => self::SYSTEM],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.65,
                    'max_tokens' => 500,
                ]);

            if (! $response->successful()) {
                return null;
            }

            return $response->json('choices.0.message.content');
        } catch (\Throwable) {
            return null;
        }
    }
}
