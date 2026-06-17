<?php

namespace App\Console\Commands;

use App\Services\Copilot\CopilotDailyDigestService;
use Illuminate\Console\Command;

class SendCopilotDailyDigestCommand extends Command
{
    protected $signature = 'copilot:send-daily-digest';

    protected $description = 'Send Jobs Copilot daily digest emails to premium users';

    public function handle(CopilotDailyDigestService $digest): int
    {
        $sent = $digest->sendDueDigests();
        $this->info("Sent {$sent} digest email(s).");

        return self::SUCCESS;
    }
}
