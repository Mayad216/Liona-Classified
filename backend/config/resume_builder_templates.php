<?php

/**
 * ResumeBuilder.com template catalog — synced from public listings at
 * https://www.resumebuilder.com/resume-templates/ (app.resumebuilder.com has no public API).
 * Each entry maps a ResumeBuilder template name to our ATS-safe render template id.
 */
return [
    'source' => 'https://www.resumebuilder.com/resume-templates/',
    'app_url' => 'https://app.resumebuilder.com',
    'styles' => ['Creative', 'Simple', 'Modern', 'ATS Friendly'],
    'categories' => [
        'Applicant Tracking Systems',
        'Basic',
        'Modern',
        'Professional',
        'Simple',
        'Minimal',
        'Traditional',
        'Executive',
    ],
    'templates' => [
        ['slug' => 'contemporary', 'name' => 'Contemporary', 'style' => 'Modern', 'template_id' => 'contemporary', 'accent' => '#2563eb', 'description' => 'Highlights experience, education, and skills for management or business roles needing a polished format.'],
        ['slug' => 'current', 'name' => 'Current', 'style' => 'Modern', 'template_id' => 'current', 'accent' => '#0ea5e9', 'description' => 'Bold headings and clean lines — ideal for fast-paced industries like tech or product management.'],
        ['slug' => 'innovative', 'name' => 'Innovative', 'style' => 'Creative', 'template_id' => 'innovative', 'accent' => '#8b5cf6', 'description' => 'Unique single-column layout for creatives wanting a visually engaging yet ATS-readable resume.'],
        ['slug' => 'polished', 'name' => 'Polished', 'style' => 'Professional', 'template_id' => 'polished', 'accent' => '#1d4ed8', 'description' => 'Straightforward design for entry-level roles where clarity and simplicity are key.'],
        ['slug' => 'minimalist', 'name' => 'Minimalist', 'style' => 'Minimal', 'template_id' => 'minimal', 'accent' => '#475569', 'description' => 'Highlighting skills and certifications — suits healthcare and care professionals.'],
        ['slug' => 'dynamic', 'name' => 'Dynamic', 'style' => 'Modern', 'template_id' => 'dynamic', 'accent' => '#059669', 'description' => 'Emphasizes relevant skills for entry-level job seekers with limited experience.'],
        ['slug' => 'bold', 'name' => 'Bold', 'style' => 'Modern', 'template_id' => 'direct', 'accent' => '#dc2626', 'description' => 'Highlights key skills for roles needing strong, clear presentation.'],
        ['slug' => 'clean', 'name' => 'Clean', 'style' => 'Simple', 'template_id' => 'clean', 'accent' => '#14b8a6', 'description' => 'Distraction-free layout for quick employer assessment.'],
        ['slug' => 'balanced', 'name' => 'Balanced', 'style' => 'Professional', 'template_id' => 'balanced', 'accent' => '#be185d', 'description' => 'Straightforward format for entry-level roles focusing on customer service and practical skills.'],
        ['slug' => 'engaging', 'name' => 'Engaging', 'style' => 'Modern', 'template_id' => 'nova', 'accent' => '#8b5cf6', 'description' => 'Clean format highlighting experience and skills for mid-level professionals.'],
        ['slug' => 'refined', 'name' => 'Refined', 'style' => 'Professional', 'template_id' => 'refined', 'accent' => '#9333ea', 'description' => 'Ideal for recent grads — emphasizes academic projects, internships, and entry-level skills.'],
        ['slug' => 'direct', 'name' => 'Direct', 'style' => 'Simple', 'template_id' => 'direct', 'accent' => '#dc2626', 'description' => 'Highlights clinical skills and certifications for healthcare graduates.'],
        ['slug' => 'plain', 'name' => 'Plain', 'style' => 'Simple', 'template_id' => 'plaintext', 'accent' => '#171717', 'description' => 'Classic layout highlighting experience, education, and skills for senior professionals.'],
        ['slug' => 'elegant', 'name' => 'Elegant', 'style' => 'Professional', 'template_id' => 'elegant', 'accent' => '#1e3a5f', 'description' => 'Great for tech graduates — emphasizes language and technical skills.'],
        ['slug' => 'stylish', 'name' => 'Stylish', 'style' => 'Modern', 'template_id' => 'pulse', 'accent' => '#ec4899', 'description' => 'Clean format for mid-level tech professionals like cybersecurity specialists.'],
        ['slug' => 'ultramodern', 'name' => 'Ultramodern', 'style' => 'Modern', 'template_id' => 'ultramodern', 'accent' => '#0891b2', 'description' => 'Highlights SEO and marketing skills in an organized ATS-friendly format.'],
        ['slug' => 'essential', 'name' => 'Essential', 'style' => 'Simple', 'template_id' => 'essential', 'accent' => '#525252', 'description' => 'Traditional roles — highlights work history and skills in a straightforward presentation.'],
        ['slug' => 'organized', 'name' => 'Organized', 'style' => 'Professional', 'template_id' => 'structured', 'accent' => '#374151', 'description' => 'Balanced layout combining skills and experience for mid-level professionals.'],
        ['slug' => 'sleek', 'name' => 'Sleek', 'style' => 'Modern', 'template_id' => 'sleek', 'accent' => '#0f766e', 'description' => 'Technical sales roles — highlights core skills like sales and client relations.'],
        ['slug' => 'sophisticated', 'name' => 'Sophisticated', 'style' => 'Professional', 'template_id' => 'sophisticated', 'accent' => '#78350f', 'description' => 'Emphasizes internships and skills for new graduates.'],
        ['slug' => 'intuitive', 'name' => 'Intuitive', 'style' => 'Creative', 'template_id' => 'intuitive', 'accent' => '#7c3aed', 'description' => 'Bold accent styling for tech professionals wanting a standout resume.'],
        ['slug' => 'efficient', 'name' => 'Efficient', 'style' => 'Professional', 'template_id' => 'corporate', 'accent' => '#0e7490', 'description' => 'Sales roles — highlights achievements, education, and skills in a structured format.'],
        ['slug' => 'trendy', 'name' => 'Trendy', 'style' => 'Modern', 'template_id' => 'signal', 'accent' => '#0ea5e9', 'description' => 'Highlights technical skills, certifications, and IT work experience.'],
        ['slug' => 'futuristic', 'name' => 'Futuristic', 'style' => 'ATS Friendly', 'template_id' => 'workday', 'accent' => '#0f766e', 'description' => 'Structured for technical roles — clear expertise without unnecessary design elements.'],
        ['slug' => 'modernized', 'name' => 'Modernized', 'style' => 'Modern', 'template_id' => 'metro', 'accent' => '#6366f1', 'description' => 'Suited for social work and people-focused professionals.'],
        ['slug' => 'classy', 'name' => 'Classy', 'style' => 'Traditional', 'template_id' => 'formal', 'accent' => '#78350f', 'description' => 'Distraction-free format for technical roles needing content focus.'],
        ['slug' => 'expressive', 'name' => 'Expressive', 'style' => 'Professional', 'template_id' => 'metro', 'accent' => '#6366f1', 'description' => 'Licensed professionals — presents credentials and responsibilities clearly.'],
        ['slug' => 'basic', 'name' => 'Basic', 'style' => 'Simple', 'template_id' => 'simple', 'accent' => '#64748b', 'description' => 'Simple design and straightforward presentation of skills and experience.'],
        ['slug' => 'professional', 'name' => 'Professional', 'style' => 'Professional', 'template_id' => 'professional', 'accent' => '#1d4ed8', 'description' => 'Wide heading tracking for corporate and business roles.'],
        ['slug' => 'traditional', 'name' => 'Traditional', 'style' => 'Traditional', 'template_id' => 'traditional', 'accent' => '#44403c', 'description' => 'Georgia serif, formal presentation for conservative industries.'],
        ['slug' => 'executive', 'name' => 'Executive', 'style' => 'Executive', 'template_id' => 'executive', 'accent' => '#991b1b', 'description' => 'Large name, serif body — leadership and executive roles.'],
        ['slug' => 'ats-host', 'name' => 'ATS Host', 'style' => 'ATS Friendly', 'template_id' => 'greenhouse', 'accent' => '#2563eb', 'description' => 'Standard headings and left-aligned layout for applicant tracking systems.'],
        ['slug' => 'modern-entry', 'name' => 'Modern — Entry Level', 'style' => 'Modern', 'template_id' => 'horizon', 'accent' => '#64748b', 'description' => 'Airy modern layout for early-career professionals.'],
        ['slug' => 'modern-mid', 'name' => 'Modern — Mid-Career', 'style' => 'Modern', 'template_id' => 'signal', 'accent' => '#0ea5e9', 'description' => 'Contemporary stripe headings for experienced professionals.'],
        ['slug' => 'modern-senior', 'name' => 'Modern — Senior Level', 'style' => 'Modern', 'template_id' => 'nova', 'accent' => '#8b5cf6', 'description' => 'Bold accent rule layout for senior-level candidates.'],
    ],
];
