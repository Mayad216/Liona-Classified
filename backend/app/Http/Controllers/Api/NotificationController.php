<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserNotification;
use App\Services\Notifications\ReviewPromptNotificationService;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected ReviewPromptNotificationService $reviewPrompts
    ) {
    }

    /** GET /api/v1/me/notifications */
    public function index(Request $request)
    {
        $profile = $request->user()->roommateProfile;
        if ($profile) {
            $this->reviewPrompts->syncForProfile($profile);
        }

        $rows = UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (UserNotification $n) => $this->serialize($n));

        return response()->json(['data' => $rows]);
    }

    /** POST /api/v1/me/notifications/mark-all-read */
    public function markAllRead(Request $request)
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    /** DELETE /api/v1/me/notifications/{notification} */
    public function destroy(Request $request, string $notification)
    {
        UserNotification::query()
            ->where('user_id', $request->user()->id)
            ->where('id', $notification)
            ->delete();

        return response()->json(['message' => 'Notification dismissed.']);
    }

    protected function serialize(UserNotification $notification): array
    {
        return [
            'id' => $notification->id,
            'userId' => (string) $notification->user_id,
            'kind' => $notification->kind,
            'title' => $notification->title,
            'body' => $notification->body,
            'href' => $notification->href,
            'createdAt' => $notification->created_at?->toIso8601String(),
            'unread' => $notification->read_at === null,
            'areaId' => $notification->area_id,
        ];
    }
}
