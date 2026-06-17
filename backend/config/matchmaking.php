<?php

/*
|--------------------------------------------------------------------------
| AI ROOMMATE MATCHMAKING — PARAMETER CONFIG (back-end mirror)
|--------------------------------------------------------------------------
|
| Single source of truth for the matchmaking engine on the API side.
| Mirror of: frontend/src/lib/matchmaking/config.ts
|
| When you give me your final parameter spec I'll only need to update
| this file and `config.ts`. The scoring engine, validation rules,
| profile model and API surface all reference values from here.
|
| Each dimension has:
|   - key         : stable id (used everywhere)
|   - label       : shown in API responses / breakdown
|   - category    : groups output (lifestyle, habits, schedule, social, background, logistics)
|   - type        : enum | multi-select | scale | boolean | range
|   - weight      : 0..1 share of the soft-score
|   - hard_filter : true = deal-breaker (excludes the match)
|   - rule        : optional override of the comparison rule
|                   (exact | scale | boolean | overlap | range | matrix)
|
| ⚠️  WEIGHTS DON'T HAVE TO SUM TO 1 — the engine normalises them.
*/

return [
    /* -------------------------------------------------------------------------
     * Engine tuning
     * ------------------------------------------------------------------------- */
    'tuning' => [
        'min_display_score' => 55,
        'great_match_at' => 85,
        'good_match_at' => 70,
        'consistency_bonus' => [
            'threshold_count' => 4,
            'per_dimension' => 0.005,
            'cap' => 0.05,
        ],
        'dealbreaker_override_min_score' => 85,
    ],

    /* -------------------------------------------------------------------------
     * Category metadata
     * ------------------------------------------------------------------------- */
    'categories' => [
        'lifestyle' => ['label' => 'Lifestyle', 'icon' => '🏡'],
        'habits' => ['label' => 'Habits', 'icon' => '🧼'],
        'schedule' => ['label' => 'Schedule', 'icon' => '🌙'],
        'social' => ['label' => 'Social vibe', 'icon' => '🎉'],
        'background' => ['label' => 'Background', 'icon' => '🌍'],
        'logistics' => ['label' => 'Logistics', 'icon' => '📋'],
    ],

    /* -------------------------------------------------------------------------
     * 👇 REPLACE THIS WHEN YOU SHARE YOUR PARAMETERS.
     *    Placeholder set mirrors the frontend config.
     * ------------------------------------------------------------------------- */
    'dimensions' => [

        // --- Hard filters (deal-breakers) ---------------------------------
        [
            'key' => 'gender_preference',
            'label' => 'Gender preference',
            'category' => 'logistics',
            'type' => ['kind' => 'enum', 'options' => ['Male', 'Female', 'Any', 'Family']],
            'weight' => 1.0,
            'search_only' => true,
        ],
        [
            'key' => 'preferred_locations',
            'label' => 'Preferred locations',
            'category' => 'logistics',
            'type' => ['kind' => 'location-select'],
            'weight' => 0.85,
            'rule' => 'overlap',
        ],
        [
            'key' => 'smoking',
            'label' => 'Smoking',
            'category' => 'habits',
            'type' => ['kind' => 'enum', 'options' => ['No smoking', 'Outdoors only', 'Smoker', 'Vape only']],
            'weight' => 0.9,
            'hard_filter' => true,
        ],
        [
            'key' => 'pets',
            'label' => 'Pets',
            'category' => 'lifestyle',
            'type' => ['kind' => 'enum', 'options' => ['No pets', 'Cats OK', 'Dogs OK', 'Any pets']],
            'weight' => 0.7,
        ],

        // --- Lifestyle scales ---------------------------------------------
        [
            'key' => 'cleanliness',
            'label' => 'Cleanliness',
            'category' => 'habits',
            'type' => ['kind' => 'scale', 'min' => 1, 'max' => 5, 'label_low' => 'Relaxed', 'label_high' => 'Spotless'],
            'weight' => 0.9,
        ],
        [
            'key' => 'noise_tolerance',
            'label' => 'Noise tolerance',
            'category' => 'lifestyle',
            'type' => ['kind' => 'scale', 'min' => 1, 'max' => 5, 'label_low' => 'Need quiet', 'label_high' => "Don't mind noise"],
            'weight' => 0.6,
        ],
        [
            'key' => 'social_level',
            'label' => 'Social with roommate',
            'category' => 'social',
            'type' => ['kind' => 'scale', 'min' => 1, 'max' => 5, 'label_low' => 'Keep to ourselves', 'label_high' => 'Best friends'],
            'weight' => 0.5,
        ],

        // --- Schedule ------------------------------------------------------
        [
            'key' => 'sleep_schedule',
            'label' => 'Sleep schedule',
            'category' => 'schedule',
            'type' => ['kind' => 'enum', 'options' => ['Early bird (≤ 10pm)', 'Standard (10pm – 1am)', 'Night owl (after 1am)']],
            'weight' => 0.7,
        ],
        [
            'key' => 'work_from_home',
            'label' => 'Work-from-home days',
            'category' => 'schedule',
            'type' => ['kind' => 'scale', 'min' => 0, 'max' => 5, 'label_low' => 'Never', 'label_high' => 'Every day'],
            'weight' => 0.4,
        ],

        // --- Social --------------------------------------------------------
        [
            'key' => 'guests',
            'label' => 'Hosting guests',
            'category' => 'social',
            'type' => ['kind' => 'enum', 'options' => ['Rarely', 'Sometimes', 'Often', 'Parties OK']],
            'weight' => 0.5,
        ],
        [
            'key' => 'alcohol',
            'label' => 'Alcohol at home',
            'category' => 'habits',
            'type' => ['kind' => 'enum', 'options' => ['Never', 'Occasionally', 'Often']],
            'weight' => 0.4,
        ],
        [
            'key' => 'diet',
            'label' => 'Diet',
            'category' => 'habits',
            'type' => ['kind' => 'enum', 'options' => ['No restrictions', 'Vegetarian', 'Vegan', 'Halal only', 'Kosher']],
            'weight' => 0.3,
        ],

        // --- Background ----------------------------------------------------
        [
            'key' => 'age_range',
            'label' => 'Preferred age range',
            'category' => 'background',
            'type' => ['kind' => 'range', 'min' => 18, 'max' => 65, 'unit' => 'yrs'],
            'weight' => 0.3,
            'rule' => 'range',
        ],
        [
            'key' => 'languages',
            'label' => 'Languages spoken',
            'category' => 'background',
            'type' => ['kind' => 'multi-select', 'options' => ['English', 'Arabic', 'Hindi', 'Urdu', 'Tagalog', 'Russian', 'French', 'Mandarin']],
            'weight' => 0.3,
        ],
        [
            'key' => 'occupation_type',
            'label' => 'Occupation type',
            'category' => 'background',
            'type' => ['kind' => 'enum', 'options' => ['Student', 'Working professional', 'Freelancer', 'Business owner', 'Other']],
            'weight' => 0.25,
        ],
        [
            'key' => 'ethnicity',
            'label' => 'Ethnicity',
            'category' => 'background',
            'optional' => true,
            'type' => [
                'kind' => 'enum',
                'options' => [
                    'Arab / Middle Eastern',
                    'South Asian',
                    'East Asian',
                    'Southeast Asian',
                    'Central Asian',
                    'African',
                    'Caribbean',
                    'European',
                    'Latin American',
                    'Mixed / Multicultural',
                    'Other',
                    'Prefer not to say',
                    'Any',
                ],
            ],
            'weight' => 0.2,
        ],

        // --- Interests -----------------------------------------------------
        [
            'key' => 'interests',
            'label' => 'Shared interests',
            'category' => 'social',
            'type' => [
                'kind' => 'multi-select',
                'max_selectable' => 5,
                'options' => [
                    'Gym & fitness', 'Yoga / meditation', 'Cooking', 'Reading', 'Gaming',
                    'Movies & TV', 'Live music', 'Travel', 'Photography',
                    'Outdoors / hiking', 'Tech / startups', 'Art & design', 'Sports',
                ],
            ],
            'weight' => 0.4,
            'rule' => 'overlap',
        ],
    ],
];
