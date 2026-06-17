<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\ResumeScreeningQuestionService;
use Illuminate\Http\Request;

class ResumeScreeningQuestionController extends Controller
{
    /** GET /api/v1/resumes/screening-questions */
    public function index(ResumeScreeningQuestionService $service)
    {
        return response()->json(['data' => $service->catalog()]);
    }

    /** POST /api/v1/resumes/screening-questions/validate */
    public function validateAnswers(Request $request, ResumeScreeningQuestionService $service)
    {
        $validated = $request->validate([
            'answers' => ['required', 'array'],
        ]);

        $missing = $service->missingRequired($validated['answers']);

        return response()->json([
            'valid' => count($missing) === 0,
            'missing' => $missing,
        ]);
    }
}
