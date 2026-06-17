<?php

return [
    'openai_api_key' => env('OPENAI_API_KEY', env('RESUME_OPENAI_API_KEY')),
    'openai_model' => env('COPILOT_OPENAI_MODEL', env('RESUME_OPENAI_MODEL', 'gpt-4o-mini')),

    'upload' => [
        'disk' => env('COPILOT_RESUME_DISK', 'local'),
        'path' => 'copilot/resumes',
        'max_kb' => (int) env('COPILOT_RESUME_MAX_KB', 5120),
        'allowed_mimes' => ['pdf', 'txt'],
    ],

    'plans' => [
        'free' => [
            'name' => 'Free',
            'auto_apply' => false,
            'daily_auto_applications' => 0,
            'monthly_auto_applications' => 0,
            'ai_credits_monthly' => 10,
        ],
        'premium_starter' => [
            'name' => 'Premium Starter',
            'auto_apply' => true,
            'daily_auto_applications' => 10,
            'monthly_auto_applications' => 100,
            'ai_credits_monthly' => 200,
        ],
        'premium_pro' => [
            'name' => 'Premium Pro',
            'auto_apply' => true,
            'daily_auto_applications' => 25,
            'monthly_auto_applications' => 500,
            'ai_credits_monthly' => 500,
        ],
        'premium_max' => [
            'name' => 'Premium Max',
            'auto_apply' => true,
            'daily_auto_applications' => 50,
            'monthly_auto_applications' => 1500,
            'ai_credits_monthly' => 1500,
        ],
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'success_url' => env('COPILOT_STRIPE_SUCCESS_URL', env('FRONTEND_URL', 'http://localhost:5173').'/jobs/copilot/billing/success'),
        'cancel_url' => env('COPILOT_STRIPE_CANCEL_URL', env('FRONTEND_URL', 'http://localhost:5173').'/jobs/copilot/billing'),
    ],

    'credit_packs' => [
        'auto_25' => [
            'name' => '25 Auto-applications',
            'price_aed' => 19,
            'auto_credits' => 25,
            'ai_credits' => 0,
            'stripe_price_id' => env('STRIPE_PRICE_AUTO_25'),
        ],
        'auto_100' => [
            'name' => '100 Auto-applications',
            'price_aed' => 49,
            'auto_credits' => 100,
            'ai_credits' => 0,
            'stripe_price_id' => env('STRIPE_PRICE_AUTO_100'),
        ],
        'auto_250' => [
            'name' => '250 Auto-applications',
            'price_aed' => 99,
            'auto_credits' => 250,
            'ai_credits' => 0,
            'stripe_price_id' => env('STRIPE_PRICE_AUTO_250'),
        ],
    ],

    'prompts' => [
        'resume_parse_system' => <<<'TXT'
You are an expert resume parser. Extract only information explicitly present in the resume.
Do not invent missing details, employers, degrees, certifications, or dates.
Return valid JSON only.
TXT,
        'resume_parse_user' => <<<'TXT'
Parse the following resume text into structured JSON with these keys:
personal_info (full_name, email, phone, location, linkedin, website),
summary,
experiences (array of job_title, company, location, start_date, end_date, is_current, bullets),
education (array of degree, school, location, start_date, end_date, description),
skills (array of strings),
languages (array of name, level),
projects (array of name, url, description, technologies),
certifications (array of name, issuer, date).

Resume text:
{{resume_text}}
TXT,
        'summary_system' => <<<'TXT'
You write professional resume summaries for the UAE job market.
Never invent employers, degrees, certifications, tools, or metrics.
Only use facts from the user profile and resume provided.
Return plain text only. Maximum 4 sentences. No markdown.
TXT,
        'summary_user' => <<<'TXT'
Write a professional summary for this candidate.

Target role: {{target_role}}

User profile and resume (source of truth):
{{user_profile}}
TXT,
        'bullet_system' => <<<'TXT'
You improve resume bullet points while keeping them truthful.
Do not invent numbers, tools, or achievements.
Return valid JSON: {"versions": ["...", "...", "..."]} with exactly 3 improved versions.
TXT,
        'bullet_user' => <<<'TXT'
Improve this resume bullet point.

Original bullet:
{{bullet}}

User role:
{{role}}
TXT,
        'tailor_system' => <<<'TXT'
You tailor resumes to job descriptions without fabricating information.
Do not add fake experience or skills.
Return valid JSON only.
TXT,
        'tailor_user' => <<<'TXT'
Tailor the resume content to better match this job.

User profile:
{{user_profile}}

Resume:
{{resume_data}}

Job description:
{{job_description}}

Return JSON with keys:
tailored_summary,
tailored_experience_bullets (array of {experience_index, bullet_index, suggested_text}),
suggested_keywords (array),
missing_information (array).
TXT,
        'keywords_system' => <<<'TXT'
You extract job keywords and compare them to a resume.
Do not suggest fabricating experience.
Return valid JSON: {"missing_keywords": [...], "already_present": [...]}
TXT,
        'keywords_user' => <<<'TXT'
Extract important keywords from the job description and compare to the resume.

Resume:
{{resume_data}}

Job description:
{{job_description}}
TXT,
        'cover_letter_system' => <<<'TXT'
You write professional cover letters for the UAE job market.
Never invent experience or qualifications. Only use the user's real profile and resume.
Maximum 250 words. Professional tone. No markdown.
TXT,
        'cover_letter_user' => <<<'TXT'
Create a concise cover letter for this job.

Job title: {{job_title}}
Company: {{company}}

User profile:
{{user_profile}}

Resume:
{{resume_data}}

Job description:
{{job_description}}
TXT,
        'screening_system' => <<<'TXT'
You answer job application screening questions truthfully based only on user-provided information.
If the answer cannot be determined, return exactly: NEEDS_USER_REVIEW
Never invent work authorization, visa status, salary, or experience.
Return plain text answer only.
TXT,
        'screening_user' => <<<'TXT'
Question:
{{question}}

User profile:
{{user_profile}}

Resume:
{{resume_data}}

Known screening answers:
{{screening_answers}}
TXT,
        'match_explain_system' => <<<'TXT'
You are an expert recruiter. Compare the user profile with the job description. Be honest and do not exaggerate.
Return valid JSON only with keys: match_score, matched_skills, missing_skills, match_reason, risks, recommendation (apply|maybe|skip).
TXT,
        'match_explain_user' => <<<'TXT'
User profile:
{{user_profile}}

Resume:
{{resume_data}}

Job description:
{{job_description}}

Deterministic score already calculated (optional reference): {{deterministic_score}}
TXT,
    ],

    'matching' => [
        'min_score' => 25,
        'weights' => [
            'title' => 20,
            'skills' => 25,
            'experience' => 15,
            'location' => 15,
            'salary' => 10,
            'industry' => 10,
            'work_authorization' => 5,
        ],
    ],

    'auto_apply' => [
        'mode' => env('COPILOT_AUTO_APPLY_MODE', 'demo'),
        'min_match_score' => (int) env('COPILOT_AUTO_APPLY_MIN_SCORE', 50),
        'confidence_threshold' => (float) env('COPILOT_AUTO_APPLY_CONFIDENCE', 0.75),
        'worker_url' => env('COPILOT_AUTO_APPLY_WORKER_URL'),
        'worker_secret' => env('COPILOT_AUTO_APPLY_WORKER_SECRET'),
        'screenshot_disk' => env('COPILOT_SCREENSHOT_DISK', 'local'),
        'consent_version' => '1.0',
        'consent_text' => <<<'TXT'
I authorize Khaleej Jobs Copilot to submit job applications on my behalf using my profile, resume, and screening answers. I understand that applications may be held for my review when information is uncertain, and that Copilot will not bypass CAPTCHAs or create accounts without my permission.
TXT,
        'confidence_weights' => [
            'profile_completion' => 0.2,
            'match_score' => 0.25,
            'resume_parsed' => 0.15,
            'screening_answers' => 0.2,
            'apply_url' => 0.1,
            'blacklist_clear' => 0.1,
        ],
        'global_blacklist' => [
            ['type' => 'domain', 'value' => 'recaptcha.net', 'reason' => 'CAPTCHA provider — manual apply required.'],
            ['type' => 'url', 'value' => 'captcha', 'reason' => 'CAPTCHA detected on apply flow.'],
        ],
        'screening_patterns' => [
            ['key' => 'work_authorization', 'regex' => '/legally authorized to work/i', 'confidence' => 0.9],
            ['key' => 'visa_sponsorship', 'regex' => '/visa sponsorship/i', 'confidence' => 0.9],
            ['key' => 'expected_salary', 'regex' => '/expected salary|salary expectation/i', 'confidence' => 0.85],
            ['key' => 'years_experience', 'regex' => '/years? of (?:relevant )?experience/i', 'confidence' => 0.85],
            ['key' => 'notice_period', 'regex' => '/notice period/i', 'confidence' => 0.8],
        ],
    ],

    'daily_digest' => [
        'enabled' => env('COPILOT_DAILY_DIGEST', true),
        'default_hour' => (int) env('COPILOT_DAILY_DIGEST_HOUR', 8),
    ],

    'embeddings' => [
        'enabled' => env('COPILOT_EMBEDDINGS_ENABLED', true),
        'model' => env('COPILOT_EMBEDDING_MODEL', 'text-embedding-3-small'),
        'blend_weight' => (float) env('COPILOT_EMBEDDING_BLEND', 0.3),
    ],

    'scraping' => [
        'enabled' => env('COPILOT_SCRAPING_ENABLED', true),
        'user_agent' => 'KhaleejCopilot/1.0 (+https://khaleej.ae)',
    ],

    'countries' => [
        'UAE' => [
            'name' => 'United Arab Emirates',
            'currency' => 'AED',
            'cities' => ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'RAK'],
        ],
        'SA' => [
            'name' => 'Saudi Arabia',
            'currency' => 'SAR',
            'cities' => ['Riyadh', 'Jeddah', 'Dammam', 'Khobar'],
        ],
        'QA' => [
            'name' => 'Qatar',
            'currency' => 'QAR',
            'cities' => ['Doha', 'Al Wakrah'],
        ],
        'KW' => [
            'name' => 'Kuwait',
            'currency' => 'KWD',
            'cities' => ['Kuwait City', 'Hawalli'],
        ],
        'BH' => [
            'name' => 'Bahrain',
            'currency' => 'BHD',
            'cities' => ['Manama', 'Muharraq'],
        ],
        'OM' => [
            'name' => 'Oman',
            'currency' => 'OMR',
            'cities' => ['Muscat', 'Salalah'],
        ],
    ],

    'screening_questions' => [
        [
            'key' => 'work_authorization',
            'text' => 'Are you legally authorized to work in the UAE?',
            'type' => 'boolean',
        ],
        [
            'key' => 'visa_sponsorship',
            'text' => 'Do you require visa sponsorship?',
            'type' => 'boolean',
        ],
        [
            'key' => 'expected_salary',
            'text' => 'What is your expected salary?',
            'type' => 'text',
        ],
        [
            'key' => 'willing_to_relocate',
            'text' => 'Are you willing to relocate within the UAE?',
            'type' => 'boolean',
        ],
        [
            'key' => 'years_experience',
            'text' => 'How many years of relevant experience do you have?',
            'type' => 'text',
        ],
        [
            'key' => 'why_interested',
            'text' => 'Why are you interested in this type of role?',
            'type' => 'text',
        ],
    ],
];
