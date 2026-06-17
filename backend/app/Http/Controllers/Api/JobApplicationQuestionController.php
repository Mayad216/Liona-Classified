<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;

class JobApplicationQuestionController extends Controller
{
    /** GET /api/v1/jobs/application-question-templates */
    public function index()
    {
        $templates = config('job_application_questions.templates', []);

        return response()->json(['data' => $templates]);
    }
}
