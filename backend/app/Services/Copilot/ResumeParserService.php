<?php

namespace App\Services\Copilot;

use App\Models\Resume;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ResumeParserService
{
    public function __construct(protected AiResumeParserService $aiParser)
    {
    }

    public function storeUpload(UploadedFile $file, int $userId): Resume
    {
        $disk = config('copilot.upload.disk', 'local');
        $dir = config('copilot.upload.path', 'copilot/resumes');
        $path = $file->store("{$dir}/{$userId}", $disk);

        $resume = Resume::create([
            'user_id' => $userId,
            'title' => pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) ?: 'Uploaded Resume',
            'template' => 'modern',
            'file_path' => $path,
            'original_file_name' => $file->getClientOriginalName(),
            'data' => Resume::emptyData(),
            'parse_status' => 'pending',
            'watermark' => false,
        ]);

        $this->ensureSingleDefault($userId, $resume);

        return $resume;
    }

    public function extractText(Resume $resume): string
    {
        if (! $resume->file_path) {
            return (string) ($resume->parsed_text ?? '');
        }

        $disk = config('copilot.upload.disk', 'local');
        if (! Storage::disk($disk)->exists($resume->file_path)) {
            throw new RuntimeException('Uploaded resume file not found.');
        }

        $absolute = Storage::disk($disk)->path($resume->file_path);
        $ext = strtolower(pathinfo($resume->original_file_name ?? $absolute, PATHINFO_EXTENSION));

        if ($ext === 'txt') {
            return trim((string) file_get_contents($absolute));
        }

        if ($ext === 'pdf') {
            return $this->extractPdfText($absolute);
        }

        throw new RuntimeException('Unsupported file type. Upload PDF or TXT for MVP.');
    }

    public function parse(Resume $resume): Resume
    {
        $resume->update(['parse_status' => 'pending']);

        try {
            $text = $this->extractText($resume);
            $structured = $this->aiParser->parseTextToStructuredData($text);

            if (! $structured) {
                throw new RuntimeException('Could not parse resume content.');
            }

            $resume->update([
                'parsed_text' => $text,
                'data' => $structured,
                'parse_status' => 'completed',
                'parsed_at' => now(),
                'ats_score' => $this->estimateAtsScore($structured),
            ]);
        } catch (\Throwable $e) {
            $resume->update(['parse_status' => 'failed']);
            throw $e;
        }

        return $resume->fresh();
    }

    public function setDefault(int $userId, Resume $resume): void
    {
        Resume::query()
            ->where('user_id', $userId)
            ->where('id', '!=', $resume->id)
            ->update(['is_default' => false]);

        $resume->update(['is_default' => true]);
    }

    private function ensureSingleDefault(int $userId, Resume $resume): void
    {
        $hasDefault = Resume::query()
            ->where('user_id', $userId)
            ->where('is_default', true)
            ->exists();

        if (! $hasDefault) {
            $resume->update(['is_default' => true]);
        }
    }

    private function extractPdfText(string $absolutePath): string
    {
        if (class_exists(\Smalot\PdfParser\Parser::class)) {
            $parser = new \Smalot\PdfParser\Parser();
            $pdf = $parser->parseFile($absolutePath);

            return trim($pdf->getText());
        }

        throw new RuntimeException(
            'PDF parsing requires smalot/pdfparser. Run: composer require smalot/pdfparser'
        );
    }

    /**
     * @param  array<string, mixed>  $data
     */
    private function estimateAtsScore(array $data): int
    {
        $score = 40;
        $pi = $data['personal_info'] ?? [];

        if (! empty($pi['full_name'])) {
            $score += 10;
        }
        if (! empty($pi['email'])) {
            $score += 5;
        }
        if (! empty($data['summary'])) {
            $score += 10;
        }
        if (count($data['experiences'] ?? []) > 0) {
            $score += 15;
        }
        if (count($data['skills'] ?? []) >= 3) {
            $score += 10;
        }
        if (count($data['education'] ?? []) > 0) {
            $score += 10;
        }

        return min(100, $score);
    }
}
