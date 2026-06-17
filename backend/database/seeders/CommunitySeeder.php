<?php

namespace Database\Seeders;

use App\Models\CommunityEvent;
use App\Models\CommunityTopic;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class CommunitySeeder extends Seeder
{
    public function run(): void
    {
        $topics = [
            ['title' => 'Best areas under AED 2k near Metro?', 'tag' => 'Dubai', 'replies_count' => 42],
            ['title' => 'Tips for first-time sharers in Sharjah', 'tag' => 'Sharjah', 'replies_count' => 28],
            ['title' => 'Roommate agreement templates — what worked for you?', 'tag' => 'Legal', 'replies_count' => 56],
            ['title' => 'Female-only flat hunt — Marina vs JLT', 'tag' => 'Marina', 'replies_count' => 19],
        ];

        foreach ($topics as $i => $t) {
            CommunityTopic::create([
                ...$t,
                'last_activity_at' => Carbon::now()->subMinutes($i * 17 + 12),
                'pinned' => $i === 0,
            ]);
        }

        CommunityEvent::create([
            'title' => 'Khaleej Coffee Meet — Dubai Marina',
            'starts_at' => Carbon::now()->addDays(13)->setTime(16, 0),
            'spot' => 'Third Wave JBR',
            'spots_remaining' => 24,
            'verified_only' => false,
        ]);

        CommunityEvent::create([
            'title' => 'Roommate speed-matching (verified only)',
            'starts_at' => Carbon::now()->addDays(18)->setTime(19, 0),
            'spot' => 'Hub71, Abu Dhabi',
            'spots_remaining' => 40,
            'verified_only' => true,
        ]);

        CommunityEvent::create([
            'title' => 'Budget rooms workshop + legal Q&A',
            'starts_at' => Carbon::now()->addDays(21)->setTime(11, 0),
            'spot' => 'Online · Zoom',
            'spots_remaining' => 200,
            'verified_only' => false,
        ]);
    }
}
