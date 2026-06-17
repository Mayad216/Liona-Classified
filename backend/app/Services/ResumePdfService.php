<?php

namespace App\Services;

use App\Models\Resume;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ResumePdfService
{
    public function __construct(private ResumeTemplateRenderer $renderer) {}

    public function download(Resume $resume): Response|StreamedResponse
    {
        $html = $this->renderer->render($resume);
        $name = str($resume->data['personal_info']['full_name'] ?? 'resume')
            ->slug()
            ->append('.pdf')
            ->toString();

        if (class_exists(\Spatie\LaravelPdf\Facades\Pdf::class)) {
            return \Spatie\LaravelPdf\Facades\Pdf::html($html)
                ->format('A4')
                ->margins(12, 12, 12, 12)
                ->name($name)
                ->download();
        }

        if (class_exists(\Barryvdh\DomPDF\Facade\Pdf::class)) {
            return \Barryvdh\DomPDF\Facade\Pdf::loadHTML($html)
                ->setPaper('a4')
                ->download($name);
        }

        return response($html, 200, [
            'Content-Type' => 'text/html; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.str_replace('.pdf', '.html', $name).'"',
        ]);
    }
}
