<?php

namespace Database\Seeders;

use App\Models\WorkspaceMembers;
use Carbon\Carbon;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WorkspaceMembersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Tạo ra 10 workspace member
        // WorkspaceMembers::factory(5)->create();
        $userIds = DB::table('users')->pluck('id')->toArray();
        
        // Lấy danh sách workspace IDs có sẵn
        $workspaceIds = DB::table('workspaces')->pluck('id')->toArray();

        // Kiểm tra nếu chưa có workspace hoặc user thì không seed
        if (empty($userIds) || empty($workspaceIds)) {
            return;
        }

        // Gán mỗi user vào ít nhất một workspace
        foreach ($userIds as $userId) {
            $assignedWorkspaces = (array) array_rand(array_flip($workspaceIds), random_int(1, min(3, count($workspaceIds))));

            foreach ($assignedWorkspaces as $workspaceId) {
                DB::table('workspace_members')->insert([
                    'workspace_id' => $workspaceId,
                    'user_id' => $userId,
                    'member_type' => random_int(0, 1) ? 'admin' : 'normal',
                    'is_unconfirmed' => false,
                    'joined' => true,
                    'is_deactivated' => false,
                    'last_active' => Carbon::now()->subDays(random_int(0, 30)),
                ]);
            }
        }
    }
}
