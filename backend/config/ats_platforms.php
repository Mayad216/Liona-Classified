<?php

/**
 * Major ATS platforms — formatting guidance synced with frontend/src/lib/resume/atsPlatforms.ts
 */
return [
    'approval_threshold' => 90,
    'platforms' => [
        [
            'id' => 'greenhouse',
            'name' => 'Greenhouse',
            'segment' => 'Tech & high-growth companies',
            'preferred_export' => 'docx_or_pdf',
            'section_headings' => ['Professional Summary', 'Work Experience', 'Education', 'Skills'],
            'avoid' => ['Creative section names', 'Two-column layouts', 'Tables for skills', 'Icons & graphics'],
            'tips' => [
                'Use exact headings: Work Experience, Education, Skills.',
                'Left-aligned single column parses best with Greenhouse\'s semantic engine.',
                'Match job-description keywords truthfully in Skills and bullets.',
            ],
        ],
        [
            'id' => 'lever',
            'name' => 'Lever',
            'segment' => 'Startups & mid-market',
            'preferred_export' => 'docx_or_pdf',
            'section_headings' => ['Professional Summary', 'Work Experience', 'Education', 'Skills'],
            'avoid' => ['Text in headers/footers', 'Graphics embedded in PDFs', 'Skill rating bars'],
            'tips' => [
                'Plain formatting with quantified bullets.',
                'Lever tolerates minor styling but prefers selectable text in PDF.',
                'Keep contact info in the document body, not a Word header.',
            ],
        ],
        [
            'id' => 'workday',
            'name' => 'Workday',
            'segment' => 'Enterprise & Fortune 500',
            'preferred_export' => 'docx',
            'section_headings' => ['Professional Summary', 'Work Experience', 'Education', 'Skills'],
            'avoid' => ['Tables', 'Text boxes', 'Columns', 'Hidden white text', 'Non-standard fonts'],
            'tips' => [
                'Submit .docx when the posting allows it — Workday parses DOCX most reliably.',
                'Use Month YYYY date ranges consistently (e.g. Jan 2022 - Present).',
                'Skills as comma-separated plain text, not grids.',
            ],
        ],
        [
            'id' => 'ashby',
            'name' => 'Ashby',
            'segment' => 'Modern tech hiring teams',
            'preferred_export' => 'docx_or_pdf',
            'section_headings' => ['Professional Summary', 'Work Experience', 'Education', 'Skills'],
            'avoid' => ['Canva/image PDFs', 'Multi-column Canva layouts', 'Non-selectable PDF text'],
            'tips' => [
                'Clean sans-serif fonts (Arial, Calibri, Helvetica).',
                'Strong action-verb bullets with metrics.',
                'Ensure PDF text is selectable if uploading PDF.',
            ],
        ],
        [
            'id' => 'icims',
            'name' => 'iCIMS',
            'segment' => 'Healthcare, retail, government contractors',
            'preferred_export' => 'docx',
            'section_headings' => ['Work Experience', 'Education', 'Skills'],
            'avoid' => ['Non-standard headings like My Story', 'Two-column layouts'],
            'tips' => ['Standard section names only.', 'Left-aligned body text throughout.'],
        ],
        [
            'id' => 'taleo',
            'name' => 'Oracle Taleo',
            'segment' => 'Legacy enterprise',
            'preferred_export' => 'docx',
            'section_headings' => ['Work Experience', 'Education', 'Skills'],
            'avoid' => ['Functional resume format', 'Complex formatting', 'Tables'],
            'tips' => ['Chronological single-column layout.', 'DOCX strongly preferred on older instances.'],
        ],
        [
            'id' => 'smartrecruiters',
            'name' => 'SmartRecruiters',
            'segment' => 'Global mid-market',
            'preferred_export' => 'docx_or_pdf',
            'section_headings' => ['Professional Summary', 'Work Experience', 'Education', 'Skills'],
            'avoid' => ['Image-only PDFs', 'Skill matrices in tables'],
            'tips' => ['Standard fonts at 10–12pt.', 'Consistent date formatting across roles.'],
        ],
    ],
];
