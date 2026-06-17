<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Support\Facades\View;

class ResumeTemplateRenderer
{
    public function render(Resume $resume): string
    {
        $templateKey = $resume->template;
        $templates = config('resume_templates', []);

        if (! array_key_exists($templateKey, $templates)) {
            $templateKey = 'modern';
        }

        $style = $templates[$templateKey];

        return View::make('resumes.templates.ats', [
            'resume' => $resume,
            'data' => $resume->data,
            'style' => $style,
            'templateKey' => $templateKey,
        ])->render();
    }
}
