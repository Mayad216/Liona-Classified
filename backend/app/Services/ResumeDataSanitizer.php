<?php

namespace App\Services;

class ResumeDataSanitizer
{
    public function sanitize(array $data): array
    {
        $clean = fn (?string $v, int $max = 500) => mb_substr(trim(strip_tags((string) $v)), 0, $max);

        if (isset($data['personal_info']) && is_array($data['personal_info'])) {
            foreach ($data['personal_info'] as $key => $value) {
                $data['personal_info'][$key] = $clean($value, 255);
            }
        }

        if (isset($data['summary'])) {
            $data['summary'] = $clean($data['summary'], 2000);
        }

        if (isset($data['skills']) && is_array($data['skills'])) {
            $data['skills'] = array_values(array_filter(array_map(
                fn ($s) => $clean($s, 60),
                $data['skills']
            )));
        }

        foreach (['experiences', 'education', 'projects', 'certifications'] as $section) {
            if (! isset($data[$section]) || ! is_array($data[$section])) {
                continue;
            }
            foreach ($data[$section] as $i => $item) {
                if (! is_array($item)) {
                    continue;
                }
                foreach ($item as $key => $value) {
                    if ($key === 'bullets' && is_array($value)) {
                        $data[$section][$i][$key] = array_values(array_map(
                            fn ($b) => $clean($b, 500),
                            $value
                        ));
                    } elseif (is_string($value)) {
                        $data[$section][$i][$key] = $clean($value, 500);
                    }
                }
            }
        }

        if (isset($data['languages']) && is_array($data['languages'])) {
            foreach ($data['languages'] as $i => $lang) {
                if (! is_array($lang)) {
                    continue;
                }
                $data['languages'][$i]['name'] = $clean($lang['name'] ?? '', 60);
                $data['languages'][$i]['level'] = $clean($lang['level'] ?? '', 40);
            }
        }

        if (isset($data['builder_screening']) && is_array($data['builder_screening'])) {
            foreach ($data['builder_screening'] as $key => $value) {
                if (is_array($value)) {
                    $data['builder_screening'][$key] = array_values(array_map(
                        fn ($v) => $clean((string) $v, 500),
                        $value
                    ));
                } else {
                    $data['builder_screening'][$key] = $clean((string) $value, 500);
                }
            }
        }

        return $data;
    }
}
