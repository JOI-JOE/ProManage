<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Workspace;
use Illuminate\Http\Request;

class WorkspaceInvitationsController extends Controller
{
    // có gửi email
    // có gửi thông báo
    public function addMemberDirect(Request $request, $idMember, $idWorkspace)
    {
        $user = User::find($idMember);
        $workspace = Workspace::find($idWorkspace);

        if (!$user || !$workspace) {
            return response()->json([
                'message' => 'User or Workspace not found',
            ], 404);
        }

        $workspace->members()->attach($user);

        // Optionally, send an email or notification to the user


        return response()->json([
            'message' => 'Member added successfully',
        ]);
    }
}
