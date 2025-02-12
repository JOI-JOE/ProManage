<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Exports\UsersExport;
use App\Imports\UsersImport;
use App\Models\User;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
class UserController extends Controller
{
    public function index()
    {
        $data = User::latest('id')->paginate(10);

        return view('admin.users.index', compact('data'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.users.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'user_name' => 'required',
            'full_name' => 'required',
            'email' => ['required', 'email', Rule::unique('users')],
            'password' => 'required|min:6',
            'role' => 'nullable',
            'github_id' => 'nullable',
            'github_avatar' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'activity_block' => ['nullable', Rule::in([0, 1])],
            'initials' => ['nullable'],
        ]);

        try {
            // $data['is_active']  ??=  0;
            if ($request->hasFile('image')) {
                $data['image'] = Storage::put('users', $request->file('image'));

            }

            if ($request->hasFile('github_avatar')) {

                $data['github_avatar'] = Storage::put('github_avatar', $request->file('github_avatar'));
            }



            User::query()->create($data);

            return redirect()
                ->route('admin.users.index')
                ->with('success', true);

        } catch (\Throwable $th) {
            if (
                (!empty($data['avatar']) && Storage::exists($data['avatar']))
                || (!empty($data['github_avatar']) && Storage::exists($data['github_avatar']))
            ) {
                Storage::delete($data['avatar']);
                Storage::delete($data['github_avatar']);
            }
            ;

            return back()
                ->with('success', false)
                ->with('error', $th->getMessage());
        }


    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return view('admin.users.show', compact('user'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $user)
    {
        return view('admin.users.edit', compact('user'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'user_name' => 'required',
            'full_name' => 'required',
            'email' => 'required|email|unique:users,email,' . $user->id,

            'password' => 'required|min:6',
            'role' => 'nullable',
            'github_id' => 'nullable',
            'github_avatar' => 'nullable|image|max:2048',
            'image' => 'nullable|image|max:2048',
            'activity_block' => ['nullable', Rule::in([0, 1])],
            
        ]);

        try {

            $data['activity_block']  ??=  0;

            if ($request->hasFile('image')) {
                $data['image'] = Storage::put('users', $request->file('image'));
            }

            if ($request->hasFile('github_avatar')) {

                $data['github_avatar'] = Storage::put('github_avatar', $request->file('github_avatar'));
            }

            $currentImage = $user->image;

            $currentGithub = $user->github_avatar;

            $user->update($data);

            if (
                $request->hasFile('image')
                && !empty($currentImage)
                && Storage::exists($currentImage)
            ) {
                Storage::delete($currentImage);
            }

            if (
                $request->hasFile('github_avatar')
                && !empty($currentGithub)
                && Storage::exists($currentGithub)
            ) {
                Storage::delete($currentGithub);
            }

            return back()
                ->with('success', true);


        } catch (\Throwable $th) {
            if (!empty($data['image']) && Storage::exists($data['image'])) {
                Storage::delete($data['image']);
            }
            if (!empty($data['github_avatar']) && Storage::exists($data['github_avatar'])) {
                Storage::delete($data['github_avatar']);
            }


            return back()
                ->with('success', false)
                ->with('error', $th->getMessage());

        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();


        if (!empty($user->image) && Storage::exists($user->image)) {
            Storage::delete($user->image);
        }
        if (!empty($user->github_avatar) && Storage::exists($user->github_avatar)) {
            Storage::delete($user->github_avatar);
        }



        return redirect()->route('admin.users.index')->with('success', true);
    }

    public function import()
    {


        return view('admin.users.import');
    }

    public function importExcelData(Request $request)
    {
        $request->validate([
            'import_file' => [
                'required',
                'file'
            ],
        ]);

        Excel::import(new UsersImport, $request->file('import_file'));

        return redirect()->back()->with('status', 'Import thành công');

    }

    public function export()
    {
        $filename = "users.xlsx";
        return Excel::download(new UsersExport, $filename);
    }

    public function search(Request $request)
    {
        $keyword = $request->input('keyword');

        // Kiểm tra xem từ khóa tìm kiếm có rỗng hay không
        if (empty($keyword)) {
            $users = collect(); // Tạo một collection rỗng
            $count = 0; // Số lượng kết quả bằng 0
        } else {
            $users = User::where('user_name', 'LIKE', "%{$keyword}%")
                ->orWhere('full_name', 'LIKE', "%{$keyword}%")
                ->orWhere('email', 'LIKE', "%{$keyword}%")
                ->get();

            $count = $users->count();
        }

        return view('admin.users.search', compact('keyword', 'users', 'count'));

    }
}
