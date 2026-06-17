<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CommunityEvent;
use App\Models\CommunityTopic;
use App\Models\EventRsvp;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommunityController extends Controller
{
    public function topics()
    {
        $rows = CommunityTopic::query()
            ->orderByDesc('pinned')
            ->orderByDesc('last_activity_at')
            ->limit(50)
            ->get()
            ->map(fn (CommunityTopic $t) => [
                'id' => (string) $t->id,
                'title' => $t->title,
                'replies' => $t->replies_count,
                'tag' => $t->tag,
                'lastActivity' => $t->last_activity_at->diffForHumans(),
            ]);

        return response()->json(['data' => $rows]);
    }

    public function events()
    {
        $rows = CommunityEvent::query()
            ->where('starts_at', '>=', Carbon::now()->subHours(6))
            ->orderBy('starts_at')
            ->limit(20)
            ->get()
            ->map(fn (CommunityEvent $e) => [
                'id' => (string) $e->id,
                'title' => $e->title,
                'date' => $e->starts_at->timezone('Asia/Dubai')->format('D j M · g:ia'),
                'spot' => $e->spot ?? 'TBA',
                'spots' => $e->spots_remaining,
                'verifiedOnly' => $e->verified_only,
            ]);

        return response()->json(['data' => $rows]);
    }

    public function storeTopic(Request $request)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:200'],
            'tag' => ['nullable', 'string', 'max:64'],
        ]);

        $topic = CommunityTopic::create([
            'user_id' => $request->user()->id,
            'title' => $data['title'],
            'tag' => $data['tag'] ?? 'General',
            'replies_count' => 0,
            'last_activity_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'id' => (string) $topic->id,
                'title' => $topic->title,
                'replies' => 0,
                'tag' => $topic->tag,
                'lastActivity' => $topic->last_activity_at->diffForHumans(),
            ],
        ], 201);
    }

    public function rsvp(Request $request, CommunityEvent $event)
    {
        $user = $request->user();

        return DB::transaction(function () use ($event, $user) {
            $locked = CommunityEvent::whereKey($event->id)->lockForUpdate()->firstOrFail();

            if ($locked->verified_only && ! $user->is_verified) {
                return response()->json(['message' => 'Verification required for this event'], 403);
            }

            $existing = EventRsvp::where('community_event_id', $locked->id)
                ->where('user_id', $user->id)
                ->exists();

            if ($existing) {
                return response()->json(['message' => 'Already RSVPed', 'spots' => $locked->spots_remaining]);
            }

            if ($locked->spots_remaining < 1) {
                return response()->json(['message' => 'Event full'], 422);
            }

            EventRsvp::create([
                'user_id' => $user->id,
                'community_event_id' => $locked->id,
            ]);

            $locked->decrement('spots_remaining');

            return response()->json([
                'message' => 'RSVP confirmed',
                'spots' => $locked->fresh()->spots_remaining,
            ]);
        });
    }
}
