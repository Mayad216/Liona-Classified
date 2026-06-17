<?php

namespace App\Models;

use App\Services\Copilot\UsageLimitService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'plan',
        'subscription_status',
        'trial_ends_at',
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscription_ends_at',
        'copilot_auto_credit_balance',
        'copilot_ai_credit_balance',
        'avatar',
        'bio',
        'is_verified',
        'emirates_id_last4',
        'emirates_id_verified_at',
        'emirates_id_status',
        'rating',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'phone_verified_at' => 'datetime',
            'trial_ends_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
            'copilot_auto_credit_balance' => 'integer',
            'copilot_ai_credit_balance' => 'integer',
            'is_verified' => 'boolean',
            'emirates_id_verified_at' => 'datetime',
            'rating' => 'float',
            'password' => 'hashed',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    // Relationships ---------------------------------------------------------

    public function listings(): HasMany
    {
        return $this->hasMany(Listing::class, 'host_id');
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'employer_id');
    }

    public function services(): HasMany
    {
        return $this->hasMany(Service::class, 'provider_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'reviewee_id');
    }

    public function favorites(): BelongsToMany
    {
        return $this->belongsToMany(Listing::class, 'favorites')->withTimestamps();
    }

    public function threads(): BelongsToMany
    {
        return $this->belongsToMany(Thread::class, 'thread_user')->withTimestamps();
    }

    public function roommateProfile(): HasOne
    {
        return $this->hasOne(RoommateProfile::class);
    }

    public function userNotifications(): HasMany
    {
        return $this->hasMany(UserNotification::class);
    }

    public function resumes(): HasMany
    {
        return $this->hasMany(Resume::class);
    }

    public function jobSeekerProfile(): HasOne
    {
        return $this->hasOne(JobSeekerProfile::class);
    }

    public function businessProfile(): HasOne
    {
        return $this->hasOne(BusinessProfile::class);
    }

    public function canPostJobs(): bool
    {
        $profile = $this->businessProfile;

        return $profile !== null && $profile->isComplete();
    }

    public function screeningAnswers(): HasMany
    {
        return $this->hasMany(UserScreeningAnswer::class);
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function jobMatches(): HasMany
    {
        return $this->hasMany(JobMatch::class);
    }

    public function savedJobs(): HasMany
    {
        return $this->hasMany(SavedJob::class);
    }

    public function usageLimits(): HasMany
    {
        return $this->hasMany(UserUsageLimit::class);
    }

    public function billingEvents(): HasMany
    {
        return $this->hasMany(CopilotBillingEvent::class);
    }

    public function autoApplyConsents(): HasMany
    {
        return $this->hasMany(AutoApplyConsent::class);
    }

    public function copilotApplications(): HasMany
    {
        return $this->hasMany(CopilotApplication::class);
    }

    public function copilotBlacklistEntries(): HasMany
    {
        return $this->hasMany(CopilotBlacklistEntry::class);
    }

    public function copilotAutomationSetting(): HasOne
    {
        return $this->hasOne(CopilotAutomationSetting::class);
    }

    public function isPremium(): bool
    {
        return $this->plan !== 'free' && in_array($this->subscription_status, ['active', 'trialing'], true);
    }

    public function copilotPlanConfig(): array
    {
        $dbPlan = SubscriptionPlan::query()->where('slug', $this->plan)->first();
        if ($dbPlan) {
            return [
                'name' => $dbPlan->name,
                'auto_apply' => $dbPlan->auto_apply_enabled,
                'daily_auto_applications' => $dbPlan->daily_application_limit,
                'monthly_auto_applications' => $dbPlan->monthly_application_limit,
                'ai_credits_monthly' => $dbPlan->ai_credit_limit,
            ];
        }

        return config('copilot.plans.'.$this->plan, config('copilot.plans.free'));
    }

    public function canUseAutoApply(): bool
    {
        return app(UsageLimitService::class)->canUseAutoApply($this);
    }

    public function hasRemainingApplicationCredits(): bool
    {
        return app(UsageLimitService::class)->hasRemainingApplicationCredits($this);
    }
}
