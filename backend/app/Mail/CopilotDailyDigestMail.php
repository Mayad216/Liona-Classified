<?php

namespace App\Mail;

use App\Models\CopilotJob;
use App\Models\Job;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class CopilotDailyDigestMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  array{submitted: int, needs_review: int, failed: int, auto_used: int, remaining: int, recent: \Illuminate\Support\Collection}  $digest
     */
    public function __construct(public User $user, public array $digest)
    {
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Your Jobs Copilot daily summary',
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->renderHtml(),
        );
    }

    private function renderHtml(): string
    {
        $name = e($this->user->name ?: 'there');
        $submitted = (int) $this->digest['submitted'];
        $needsReview = (int) $this->digest['needs_review'];
        $failed = (int) $this->digest['failed'];
        $remaining = (int) $this->digest['remaining'];
        $dashboardUrl = e(config('app.frontend_url', 'http://localhost:5173').'/jobs/copilot/applications');

        $rows = '';
        foreach ($this->digest['recent'] as $app) {
            $job = $app->jobMatch?->matchable;
            $title = 'Job';
            if ($job instanceof Job || $job instanceof CopilotJob) {
                $title = $job->title ?? 'Job';
            }
            $title = e($title);
            $status = e(str_replace('_', ' ', $app->status));
            $rows .= "<li><strong>{$title}</strong> — {$status}</li>";
        }

        return <<<HTML
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
            <h2>Jobs Copilot daily summary</h2>
            <p>Hi {$name},</p>
            <p>Here's your auto-apply activity from the last 24 hours:</p>
            <ul>
                <li><strong>{$submitted}</strong> submitted</li>
                <li><strong>{$needsReview}</strong> need your review</li>
                <li><strong>{$failed}</strong> failed</li>
                <li><strong>{$remaining}</strong> auto-applications remaining this month</li>
            </ul>
            <p><strong>Recent applications</strong></p>
            <ul>{$rows}</ul>
            <p><a href="{$dashboardUrl}">Review applications</a></p>
        </div>
        HTML;
    }
}
