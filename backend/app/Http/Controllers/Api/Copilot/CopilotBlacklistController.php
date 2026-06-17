<?php

namespace App\Http\Controllers\Api\Copilot;

use App\Http\Controllers\Controller;
use App\Services\Copilot\BlacklistService;
use Illuminate\Http\Request;

class CopilotBlacklistController extends Controller
{
    public function __construct(protected BlacklistService $blacklist)
    {
    }

    /** GET /api/v1/copilot/automation/blacklist */
    public function index(Request $request)
    {
        return response()->json([
            'data' => $this->blacklist->listForUser($request->user()),
        ]);
    }

    /** POST /api/v1/copilot/automation/blacklist */
    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => 'required|in:company,domain,url',
            'value' => 'required|string|max:255',
            'reason' => 'nullable|string|max:255',
        ]);

        $entry = $this->blacklist->add(
            $request->user(),
            $data['type'],
            $data['value'],
            $data['reason'] ?? null
        );

        return response()->json([
            'message' => 'Blacklist entry added.',
            'data' => $entry,
        ], 201);
    }

    /** DELETE /api/v1/copilot/automation/blacklist/{entryId} */
    public function destroy(Request $request, int $entryId)
    {
        $deleted = $this->blacklist->remove($request->user(), $entryId);
        abort_unless($deleted, 404);

        return response()->json(['message' => 'Blacklist entry removed.']);
    }
}
