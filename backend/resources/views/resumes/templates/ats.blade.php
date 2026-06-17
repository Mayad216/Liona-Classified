<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>{{ $data['personal_info']['full_name'] ?? 'Resume' }}</title>
    @php
        $hBorder = $style['heading_border'] ?? 'bottom';
        $hUpper = !empty($style['heading_uppercase']);
        $borderTop = $hBorder === 'both' ? '1px solid #000' : 'none';
        $borderBottom = in_array($hBorder, ['bottom', 'both'], true) ? '1px solid #000' : 'none';
    @endphp
    <style>
        @page { margin: 18mm 16mm; }
        body {
            font-family: {!! $style['font'] !!};
            font-size: {{ $style['font_size'] }};
            line-height: {{ $style['line_height'] }};
            color: #000;
        }
        header { text-align: {{ $style['header_align'] }}; }
        h1 { font-size: {{ $style['name_size'] }}; font-weight: 700; margin: 0 0 4px; }
        h2 {
            font-size: {{ $style['heading_size'] }};
            font-weight: 700;
            text-transform: {{ $hUpper ? 'uppercase' : 'none' }};
            text-align: {{ $style['heading_align'] }};
            letter-spacing: {{ $style['heading_letter_spacing'] }};
            margin: 16px 0 8px;
            padding-top: {{ $hBorder === 'both' ? '4px' : '0' }};
            padding-bottom: {{ in_array($hBorder, ['bottom', 'both'], true) ? '2px' : '0' }};
            border-top: {{ $borderTop }};
            border-bottom: {{ $borderBottom }};
        }
        .meta { font-size: {{ $style['contact_size'] }}; margin: 4px 0 8px; }
        .item { margin-bottom: {{ $style['item_spacing'] }}; page-break-inside: avoid; }
        .title { margin: 0 0 2px; font-weight: 700; }
        .sub { margin: 0 0 4px; font-size: {{ $style['contact_size'] }}; }
        ul { margin: 4px 0 0 18px; padding: 0; list-style: disc; }
        li { margin-bottom: 3px; }
        p { margin: 0 0 4px; }
        .watermark {
            position: fixed;
            bottom: 10mm;
            right: 10mm;
            opacity: 0.35;
            font-size: 8pt;
            color: #666;
        }
    </style>
</head>
<body>
    @include('resumes.partials.content', ['data' => $data])
    @if($resume->watermark)
        <div class="watermark">Created with Khaleej</div>
    @endif
</body>
</html>
