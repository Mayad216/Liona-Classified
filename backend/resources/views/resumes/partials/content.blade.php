@php
    $pi = $data['personal_info'] ?? [];
    $name = $pi['full_name'] ?? 'Your Name';
    $contact = array_filter([
        $pi['email'] ?? null,
        $pi['phone'] ?? null,
        $pi['location'] ?? null,
        $pi['linkedin'] ?? null,
        $pi['website'] ?? null,
    ]);
@endphp

{{-- ATS-friendly: single column, standard headings, plain text, no flex/tables/icons --}}

<header>
    <h1>{{ $name }}</h1>
    @if(count($contact))
        <p class="meta">{{ implode(' | ', $contact) }}</p>
    @endif
</header>

@if(!empty($data['summary']))
    <h2>Professional Summary</h2>
    <p>{{ $data['summary'] }}</p>
@endif

@if(!empty($data['experiences']))
    <h2>Work Experience</h2>
    @foreach($data['experiences'] as $exp)
        <div class="item">
            <p class="title">
                <strong>{{ $exp['job_title'] ?? '' }}</strong>@if(!empty($exp['company'])), {{ $exp['company'] }}@endif
            </p>
            @php
                $dates = ($exp['start_date'] ?? '') . ' - ' . (!empty($exp['is_current']) ? 'Present' : ($exp['end_date'] ?? ''));
                $meta = array_filter([$exp['location'] ?? null, trim($dates, ' -') ?: null]);
            @endphp
            @if(count($meta))
                <p class="sub">{{ implode(' | ', $meta) }}</p>
            @endif
            @if(!empty($exp['bullets']))
                <ul>
                    @foreach($exp['bullets'] as $bullet)
                        @if(trim($bullet) !== '')
                            <li>{{ $bullet }}</li>
                        @endif
                    @endforeach
                </ul>
            @endif
        </div>
    @endforeach
@endif

@if(!empty($data['education']))
    <h2>Education</h2>
    @foreach($data['education'] as $edu)
        <div class="item">
            <p class="title">
                <strong>{{ $edu['degree'] ?? '' }}</strong>@if(!empty($edu['school'])), {{ $edu['school'] }}@endif
            </p>
            @php
                $eduDates = trim(($edu['start_date'] ?? '') . ' - ' . ($edu['end_date'] ?? ''), ' -');
                $eduMeta = array_filter([$edu['location'] ?? null, $eduDates ?: null]);
            @endphp
            @if(count($eduMeta))
                <p class="sub">{{ implode(' | ', $eduMeta) }}</p>
            @endif
            @if(!empty($edu['description']))
                <p>{{ $edu['description'] }}</p>
            @endif
        </div>
    @endforeach
@endif

@if(!empty($data['skills']))
    <h2>Skills</h2>
    <p>{{ implode(', ', $data['skills']) }}</p>
@endif

@if(!empty($data['languages']))
    <h2>Languages</h2>
    <p>
        @foreach($data['languages'] as $lang)
            {{ $lang['name'] ?? '' }}@if(!empty($lang['level'])) ({{ $lang['level'] }})@endif@if(!$loop->last), @endif
        @endforeach
    </p>
@endif

@if(!empty($data['projects']))
    <h2>Projects</h2>
    @foreach($data['projects'] as $proj)
        <div class="item">
            <p class="title"><strong>{{ $proj['name'] ?? '' }}</strong></p>
            @if(!empty($proj['url']))
                <p class="sub">{{ $proj['url'] }}</p>
            @endif
            @if(!empty($proj['description']))
                <p>{{ $proj['description'] }}</p>
            @endif
        </div>
    @endforeach
@endif

@if(!empty($data['certifications']))
    <h2>Certifications</h2>
    @foreach($data['certifications'] as $cert)
        <div class="item">
            <p class="title">
                <strong>{{ $cert['name'] ?? '' }}</strong>@if(!empty($cert['date'])) ({{ $cert['date'] }})@endif
            </p>
            @if(!empty($cert['issuer']))
                <p class="sub">{{ $cert['issuer'] }}</p>
            @endif
        </div>
    @endforeach
@endif
