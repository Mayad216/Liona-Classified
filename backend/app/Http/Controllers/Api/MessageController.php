<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Thread;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function threads(Request $request)
    {
        $threads = $request->user()
            ->threads()
            ->with(['participants:id,name,avatar', 'messages' => fn ($q) => $q->latest()->limit(1)])
            ->latest('updated_at')
            ->paginate(20);

        return response()->json($threads);
    }

    public function show(Request $request, Thread $thread)
    {
        abort_unless($thread->participants->contains($request->user()->id), 403);

        return response()->json([
            'data' => $thread->load('participants:id,name,avatar', 'messages.sender:id,name,avatar'),
        ]);
    }

    public function sendMessage(Request $request, Thread $thread)
    {
        abort_unless($thread->participants->contains($request->user()->id), 403);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = $thread->messages()->create([
            'sender_id' => $request->user()->id,
            'body' => $data['body'],
        ]);

        $thread->touch();

        return response()->json(['data' => $message->load('sender:id,name,avatar')], 201);
    }
}
