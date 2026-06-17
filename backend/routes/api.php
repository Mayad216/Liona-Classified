<?php

use App\Http\Controllers\Api\Copilot\CopilotAutoApplyController;
use App\Http\Controllers\Api\Copilot\CopilotAutoApplyWorkerController;
use App\Http\Controllers\Api\Copilot\CopilotAutomationSettingsController;
use App\Http\Controllers\Api\Copilot\CopilotBlacklistController;
use App\Http\Controllers\Api\Copilot\CopilotBillingController;
use App\Http\Controllers\Api\Copilot\CopilotScreenshotController;
use App\Http\Controllers\Api\Copilot\CopilotStripeWebhookController;
use App\Http\Controllers\Api\Copilot\CopilotAiController;
use App\Http\Controllers\Api\Copilot\CopilotDashboardController;
use App\Http\Controllers\Api\Copilot\CopilotJobController;
use App\Http\Controllers\Api\Copilot\CopilotRegionController;
use App\Http\Controllers\Api\Copilot\JobSeekerProfileController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BusinessProfileController;
use App\Http\Controllers\Api\EmiratesIdVerificationController;
use App\Http\Controllers\Api\CommunityController;
use App\Http\Controllers\Api\JobController;
use App\Http\Controllers\Api\JobApplicationQuestionController;
use App\Http\Controllers\Api\JobListingAiController;
use App\Http\Controllers\Api\JobListingOptionController;
use App\Http\Controllers\Api\ListingController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ResumeAiController;
use App\Http\Controllers\Api\ResumeController;
use App\Http\Controllers\Api\ResumeScreeningQuestionController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\RoommateMatchController;
use App\Http\Controllers\Api\ServiceController;
use App\Http\Controllers\Api\ServiceListingAiController;
use App\Http\Controllers\Api\UaeLocationController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Khaleej Classifieds — versioned under /api/v1
*/

Route::prefix('v1')->group(function () {

    // ------------------- Public -------------------
    Route::post('auth/register', [AuthController::class, 'register']);
    Route::post('auth/login', [AuthController::class, 'login']);

    Route::get('listings', [ListingController::class, 'index']);
    Route::get('listings/{listing}', [ListingController::class, 'show']);

    Route::get('jobs', [JobController::class, 'index']);
    Route::get('jobs/listing-options', [JobListingOptionController::class, 'index']);
    Route::post('jobs/listing-options', [JobListingOptionController::class, 'store']);
    Route::get('jobs/application-question-templates', [JobApplicationQuestionController::class, 'index']);
    Route::get('jobs/{job}', [JobController::class, 'show']);

    Route::get('services', [ServiceController::class, 'index']);
    Route::get('services/{service}', [ServiceController::class, 'show']);

    Route::get('uae/locations', [UaeLocationController::class, 'index']);

    // Roommate matchmaking — public config so the React form stays in sync
    Route::get('matchmaking/config', [RoommateMatchController::class, 'config']);

    Route::get('community/topics', [CommunityController::class, 'topics']);
    Route::get('community/events', [CommunityController::class, 'events']);

    Route::get('copilot/pricing', [CopilotDashboardController::class, 'pricing']);
    Route::get('copilot/countries', [CopilotRegionController::class, 'countries']);
    Route::get('copilot/billing/plans', [CopilotBillingController::class, 'plans']);
    Route::post('webhooks/stripe/copilot', CopilotStripeWebhookController::class);

    Route::middleware('copilot.worker')->prefix('copilot/auto-apply/worker')->group(function () {
        Route::get('pending', [CopilotAutoApplyWorkerController::class, 'pending']);
        Route::post('report', [CopilotAutoApplyWorkerController::class, 'report']);
        Route::post('screenshot', [CopilotAutoApplyWorkerController::class, 'screenshot']);
    });

    Route::get('resumes/templates', [ResumeController::class, 'templates']);
    Route::get('resumes/templates/resumebuilder', [ResumeController::class, 'resumeBuilderTemplates']);
    Route::get('resumes/screening-questions', [ResumeScreeningQuestionController::class, 'index']);
    Route::post('resumes/screening-questions/validate', [ResumeScreeningQuestionController::class, 'validateAnswers']);
    Route::get('resumes/share/{shareToken}', [ResumeController::class, 'publicShow']);
    Route::get('resumes/share/{shareToken}/json', [ResumeController::class, 'publicJson']);
    Route::get('resumes/share/{shareToken}/download', [ResumeController::class, 'publicDownload']);

    Route::post('guest/resumes', [ResumeController::class, 'guestStore']);
    Route::get('guest/resumes/{resume}', [ResumeController::class, 'guestShow']);
    Route::put('guest/resumes/{resume}', [ResumeController::class, 'guestUpdate']);
    Route::get('guest/resumes/{resume}/download', [ResumeController::class, 'guestDownload']);

    // ------------------- Authenticated -------------------
    Route::middleware('auth:sanctum')->group(function () {

        Route::get('auth/me', [AuthController::class, 'me']);
        Route::post('auth/logout', [AuthController::class, 'logout']);

        // Listings
        Route::post('listings', [ListingController::class, 'store']);
        Route::put('listings/{listing}', [ListingController::class, 'update']);
        Route::delete('listings/{listing}', [ListingController::class, 'destroy']);
        Route::post('listings/{listing}/favorite', [ListingController::class, 'favorite']);

        // Jobs
        Route::post('jobs', [JobController::class, 'store']);
        Route::put('jobs/{job}', [JobController::class, 'update']);
        Route::delete('jobs/{job}', [JobController::class, 'destroy']);
        Route::post('jobs/{job}/apply', [JobController::class, 'apply']);
        Route::post('jobs/ai/listing-suggestions', [JobListingAiController::class, 'suggest']);

        // Services
        Route::post('services', [ServiceController::class, 'store']);
        Route::post('services/ai/listing-description', [ServiceListingAiController::class, 'suggest']);
        Route::post('services/{service}/book', [ServiceController::class, 'book']);

        // Messaging
        Route::get('threads', [MessageController::class, 'threads']);
        Route::get('threads/{thread}', [MessageController::class, 'show']);
        Route::post('threads/{thread}/messages', [MessageController::class, 'sendMessage']);

        // Reviews
        Route::post('reviews', [ReviewController::class, 'store']);

        // Profile
        Route::get('me', [UserController::class, 'me']);
        Route::put('me', [UserController::class, 'update']);

        Route::get('me/emirates-id-verification', [EmiratesIdVerificationController::class, 'show']);
        Route::post('me/emirates-id-verification', [EmiratesIdVerificationController::class, 'submit']);

        // Roommate matchmaking — authenticated surface
        Route::get('me/roommate-profile', [RoommateMatchController::class, 'show']);
        Route::post('me/roommate-profile', [RoommateMatchController::class, 'upsert']);

        Route::get('me/business-profile', [BusinessProfileController::class, 'show']);
        Route::put('me/business-profile', [BusinessProfileController::class, 'upsert']);

        Route::get('me/notifications', [NotificationController::class, 'index']);
        Route::post('me/notifications/mark-all-read', [NotificationController::class, 'markAllRead']);
        Route::delete('me/notifications/{notification}', [NotificationController::class, 'destroy']);
        Route::get('roommate-matches', [RoommateMatchController::class, 'index']);
        Route::get('roommate-matches/{user}', [RoommateMatchController::class, 'pair']);

        Route::post('community/topics', [CommunityController::class, 'storeTopic']);
        Route::post('community/events/{event}/rsvp', [CommunityController::class, 'rsvp']);

        Route::get('resumes', [ResumeController::class, 'index']);
        Route::post('resumes', [ResumeController::class, 'store']);
        Route::get('resumes/{resume}', [ResumeController::class, 'show']);
        Route::put('resumes/{resume}', [ResumeController::class, 'update']);
        Route::delete('resumes/{resume}', [ResumeController::class, 'destroy']);
        Route::get('resumes/{resume}/preview', [ResumeController::class, 'preview']);
        Route::get('resumes/{resume}/download', [ResumeController::class, 'download']);
        Route::post('resumes/{resume}/publish', [ResumeController::class, 'publish']);
        Route::post('resumes/claim-guest', [ResumeController::class, 'claimGuest']);
        Route::post('resumes/subscribe/pro', [ResumeController::class, 'subscribePro']);

        Route::post('resumes/ai/summary', [ResumeAiController::class, 'summary']);
        Route::post('resumes/ai/bullet', [ResumeAiController::class, 'bullet']);
        Route::post('resumes/ai/tailor', [ResumeAiController::class, 'tailor']);
        Route::post('resumes/ai/keywords', [ResumeAiController::class, 'keywords']);
        Route::post('resumes/ai/autocomplete', [ResumeAiController::class, 'autocomplete']);
        Route::post('resumes/ai/job-descriptions', [ResumeAiController::class, 'jobDescriptions']);
        Route::post('resumes/ai/skills', [ResumeAiController::class, 'skills']);

        // Jobs Copilot
        Route::prefix('copilot')->group(function () {
            Route::get('dashboard', [CopilotDashboardController::class, 'index']);
            Route::get('applications', [CopilotDashboardController::class, 'applications']);
            Route::get('profile', [JobSeekerProfileController::class, 'show']);
            Route::put('profile', [JobSeekerProfileController::class, 'upsert']);
            Route::get('resumes', [CopilotResumeController::class, 'index']);
            Route::post('resumes/upload', [CopilotResumeController::class, 'upload']);
            Route::get('resumes/{resume}', [CopilotResumeController::class, 'show']);
            Route::post('resumes/{resume}/parse', [CopilotResumeController::class, 'parse']);
            Route::post('resumes/{resume}/set-default', [CopilotResumeController::class, 'setDefault']);

            Route::get('jobs/recommended', [CopilotJobController::class, 'recommended']);
            Route::post('jobs/matches/recalculate', [CopilotJobController::class, 'recalculate']);
            Route::get('jobs/matches/{jobMatch}', [CopilotJobController::class, 'show']);
            Route::post('jobs/matches/{jobMatch}/save', [CopilotJobController::class, 'save']);
            Route::delete('jobs/matches/{jobMatch}/save', [CopilotJobController::class, 'unsave']);
            Route::post('jobs/matches/{jobMatch}/dismiss', [CopilotJobController::class, 'dismiss']);
            Route::post('jobs/platform/{job}/match', [CopilotJobController::class, 'matchPlatformJob']);

            Route::get('ai/usage', [CopilotAiController::class, 'usage']);
            Route::post('ai/generate-summary', [CopilotAiController::class, 'generateSummary']);
            Route::post('ai/improve-bullet', [CopilotAiController::class, 'improveBullet']);
            Route::post('ai/tailor-resume', [CopilotAiController::class, 'tailorResume']);
            Route::post('ai/extract-job-keywords', [CopilotAiController::class, 'extractKeywords']);
            Route::post('ai/generate-cover-letter', [CopilotAiController::class, 'generateCoverLetter']);
            Route::post('ai/generate-screening-answer', [CopilotAiController::class, 'generateScreeningAnswer']);
            Route::post('ai/explain-match', [CopilotAiController::class, 'explainMatch']);

            Route::get('billing', [CopilotBillingController::class, 'show']);
            Route::post('billing/checkout', [CopilotBillingController::class, 'checkout']);
            Route::post('billing/credit-pack', [CopilotBillingController::class, 'creditPack']);
            Route::post('billing/cancel', [CopilotBillingController::class, 'cancel']);
            Route::post('billing/resume', [CopilotBillingController::class, 'resume']);

            Route::middleware('copilot.premium')->group(function () {
                Route::get('auto-apply/consent', [CopilotAutoApplyController::class, 'consentStatus']);
                Route::post('auto-apply/consent', [CopilotAutoApplyController::class, 'grantConsent']);
                Route::delete('auto-apply/consent', [CopilotAutoApplyController::class, 'revokeConsent']);
                Route::get('auto-apply/applications', [CopilotAutoApplyController::class, 'applications']);
                Route::get('auto-apply/applications/{copilotApplication}', [CopilotAutoApplyController::class, 'show']);
                Route::get('auto-apply/applications/{copilotApplication}/logs', [CopilotAutoApplyController::class, 'logs']);
                Route::post('auto-apply/applications/{copilotApplication}/approve', [CopilotAutoApplyController::class, 'approve']);
                Route::post('auto-apply/applications/{copilotApplication}/cancel', [CopilotAutoApplyController::class, 'cancel']);
                Route::get('auto-apply/applications/{copilotApplication}/screenshots/{encodedPath}', [CopilotScreenshotController::class, 'showForApplication']);
                Route::post('jobs/matches/{jobMatch}/auto-apply', [CopilotAutoApplyController::class, 'queue']);

                Route::get('automation/settings', [CopilotAutomationSettingsController::class, 'show']);
                Route::put('automation/settings', [CopilotAutomationSettingsController::class, 'update']);
                Route::get('automation/digest/preview', [CopilotAutomationSettingsController::class, 'digestPreview']);
                Route::get('automation/blacklist', [CopilotBlacklistController::class, 'index']);
                Route::post('automation/blacklist', [CopilotBlacklistController::class, 'store']);
                Route::delete('automation/blacklist/{entryId}', [CopilotBlacklistController::class, 'destroy']);
            });
        });
    });

    // ------------------- Admin -------------------
    Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function () {
        Route::get('stats', [\App\Http\Controllers\Api\Admin\StatsController::class, 'index']);
        Route::patch('listings/{listing}/approve', [\App\Http\Controllers\Api\Admin\ListingModerationController::class, 'approve']);
        Route::patch('listings/{listing}/reject', [\App\Http\Controllers\Api\Admin\ListingModerationController::class, 'reject']);

        Route::get('copilot/job-sources', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'jobSources']);
        Route::post('copilot/job-sources', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'storeJobSource']);
        Route::patch('copilot/job-sources/{jobSource}', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'updateJobSource']);
        Route::post('copilot/job-sources/{jobSource}/scrape', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'scrapeJobSource']);
        Route::get('copilot/scrape-runs', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'scrapeRuns']);
        Route::get('copilot/monitoring', [\App\Http\Controllers\Api\Admin\CopilotAdminMonitoringController::class, 'index']);
        Route::get('copilot/jobs', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'indexJobs']);
        Route::post('copilot/jobs/import', [\App\Http\Controllers\Api\Admin\CopilotJobAdminController::class, 'importJobs']);
    });

});
