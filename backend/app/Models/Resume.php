<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class Resume extends Model
{
    protected $fillable = [
        'user_id',
        'guest_token',
        'title',
        'template',
        'file_path',
        'original_file_name',
        'data',
        'parsed_text',
        'is_default',
        'ats_score',
        'parse_status',
        'parsed_at',
        'share_token',
        'is_public',
        'watermark',
    ];

    protected function casts(): array
    {
        return [
            'data' => 'array',
            'is_public' => 'boolean',
            'watermark' => 'boolean',
            'is_default' => 'boolean',
            'parsed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Resume $resume) {
            $resume->share_token ??= (string) Str::uuid();
            $resume->data ??= self::emptyData();
        });
    }

    public static function emptyData(): array
    {
        return [
            'personal_info' => [
                'full_name' => '',
                'email' => '',
                'phone' => '',
                'location' => '',
                'linkedin' => '',
                'website' => '',
            ],
            'summary' => '',
            'experiences' => [],
            'education' => [],
            'skills' => [],
            'languages' => [],
            'projects' => [],
            'certifications' => [],
            'builder_screening' => [],
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ownedBy(?int $userId, ?string $guestToken): bool
    {
        if ($userId && $this->user_id === $userId) {
            return true;
        }

        return $guestToken && $this->guest_token === $guestToken;
    }
}
