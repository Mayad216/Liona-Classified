<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function me(Request $request)
    {
        return response()->json([
            'data' => $request->user()->loadCount(['listings', 'jobs', 'services']),
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'string', 'max:120'],
            'phone' => ['sometimes', 'string', 'max:32'],
            'bio' => ['sometimes', 'string', 'max:2000'],
            'avatar' => ['sometimes', 'url'],
        ]);

        $request->user()->update($data);

        return response()->json(['data' => $request->user()]);
    }
}
