<?php

namespace App\Services\Notifications;

use App\Models\RoommateProfile;
use App\Models\UserNotification;
use App\Services\AreaReviews\AreaReviewEligibilityService;

class ReviewPromptNotificationService
{
    public function __construct(
        protected AreaReviewEligibilityService $eligibility
    ) {
    }

    public function reviewPromptId(int|string $userId, string $areaId): string
    {
        return 'review-prompt:'.$userId.':'.$areaId;
    }

    public function reviewPromptBody(string $placeName, string $residenceStatus): string
    {
        if ($residenceStatus === 'current') {
            return "How is it at {$placeName}? Leave a review for the community.";
        }

        return "How was it during your time at {$placeName}? Leave a review for the community.";
    }

    public function syncForProfile(RoommateProfile $profile): void
    {
        $userId = $profile->user_id;
        $preferences = $profile->preferences ?? [];
        $residence = $this->eligibility->hydrateResidenceFromPreferences($preferences);

        foreach (config('area_insights', []) as $insight) {
            $result = $this->eligibility->checkEligibility($residence, $insight);

            if (empty($result['eligible'])) {
                continue;
            }

            $id = $this->reviewPromptId($userId, $insight['id']);

            if (UserNotification::query()->where('id', $id)->exists()) {
                continue;
            }

            UserNotification::query()->create([
                'id' => $id,
                'user_id' => $userId,
                'kind' => 'review_prompt',
                'title' => 'Share your experience?',
                'body' => $this->reviewPromptBody(
                    $insight['name'],
                    $result['residenceStatus'] ?? 'past'
                ),
                'href' => '/community/areas/'.$insight['id'],
                'area_id' => $insight['id'],
                'read_at' => null,
            ]);
        }
    }
}
