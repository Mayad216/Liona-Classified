<?php

namespace App\Services\Copilot;

use App\Models\CopilotBlacklistEntry;
use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\User;
use Illuminate\Support\Str;

class BlacklistService
{
    /**
     * @return array{blocked: bool, reason?: string, match?: string}
     */
    public function check(User $user, mixed $job, ?string $applyUrl = null): array
    {
        $company = $this->resolveCompany($job);
        $domain = $this->extractDomain($applyUrl ?? $this->resolveApplyUrl($job));
        $url = $applyUrl ?? $this->resolveApplyUrl($job);

        foreach (config('copilot.auto_apply.global_blacklist', []) as $entry) {
            if ($this->matchesGlobal($entry, $company, $domain, $url)) {
                return [
                    'blocked' => true,
                    'reason' => $entry['reason'] ?? 'Blocked by platform policy.',
                    'match' => $entry['value'] ?? null,
                ];
            }
        }

        $entries = CopilotBlacklistEntry::query()->where('user_id', $user->id)->get();
        foreach ($entries as $entry) {
            if ($this->matchesEntry($entry, $company, $domain, $url)) {
                return [
                    'blocked' => true,
                    'reason' => $entry->reason ?? 'Blocked by your blacklist.',
                    'match' => $entry->value,
                ];
            }
        }

        return ['blocked' => false];
    }

    public function listForUser(User $user)
    {
        return CopilotBlacklistEntry::query()
            ->where('user_id', $user->id)
            ->orderBy('type')
            ->orderBy('value')
            ->get();
    }

    public function add(User $user, string $type, string $value, ?string $reason = null): CopilotBlacklistEntry
    {
        $normalized = $this->normalizeValue($type, $value);

        return CopilotBlacklistEntry::updateOrCreate(
            ['user_id' => $user->id, 'type' => $type, 'value' => $normalized],
            ['reason' => $reason]
        );
    }

    public function remove(User $user, int $entryId): bool
    {
        return (bool) CopilotBlacklistEntry::query()
            ->where('user_id', $user->id)
            ->where('id', $entryId)
            ->delete();
    }

    private function matchesGlobal(array $entry, ?string $company, ?string $domain, ?string $url): bool
    {
        $type = $entry['type'] ?? 'domain';
        $value = $this->normalizeValue($type, (string) ($entry['value'] ?? ''));

        return $this->matchesValue($type, $value, $company, $domain, $url);
    }

    private function matchesEntry(CopilotBlacklistEntry $entry, ?string $company, ?string $domain, ?string $url): bool
    {
        return $this->matchesValue($entry->type, $entry->value, $company, $domain, $url);
    }

    private function matchesValue(string $type, string $value, ?string $company, ?string $domain, ?string $url): bool
    {
        return match ($type) {
            'company' => $company && Str::lower($company) === Str::lower($value),
            'domain' => $domain && (Str::lower($domain) === Str::lower($value) || Str::endsWith(Str::lower($domain), '.'.Str::lower($value))),
            'url' => $url && Str::contains(Str::lower($url), Str::lower($value)),
            default => false,
        };
    }

    private function normalizeValue(string $type, string $value): string
    {
        $value = trim($value);

        if ($type === 'domain') {
            $value = preg_replace('#^https?://#i', '', $value) ?? $value;
            $value = explode('/', $value)[0];
            $value = ltrim($value, '.');
        }

        if ($type === 'company') {
            $value = Str::lower($value);
        }

        return $value;
    }

    private function extractDomain(?string $url): ?string
    {
        if (! $url) {
            return null;
        }

        $host = parse_url($url, PHP_URL_HOST);

        return $host ? Str::lower($host) : null;
    }

    private function resolveCompany(mixed $job): ?string
    {
        if ($job instanceof Job) {
            return $job->company;
        }
        if ($job instanceof CopilotJob) {
            return $job->company_name;
        }

        return null;
    }

    private function resolveApplyUrl(mixed $job): ?string
    {
        if ($job instanceof Job) {
            return url("/jobs/{$job->id}");
        }
        if ($job instanceof CopilotJob) {
            return $job->application_url ?? $job->source_url;
        }

        return null;
    }
}
