<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class WorkspaceController extends Controller
{
    public function getWorkspaceByUser(Request $request)
    {
        $user = $request->user();
        $workspace = $user->workspace;
        return response()->json($workspace);
    }
}
