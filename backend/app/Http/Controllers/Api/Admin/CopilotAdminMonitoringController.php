<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\Copilot\CopilotMonitoringService;

class CopilotAdminMonitoringController extends Controller
{
    public function __construct(protected CopilotMonitoringService $monitoring)
    {
    }

    /** GET /api/v1/admin/copilot/monitoring */
    public function index()
    {
        return response()->json(['data' => $this->monitoring->dashboard()]);
    }
}
