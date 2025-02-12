@extends('admin.layouts.master')
@section('content')


<div class="container">
    {{-- @if (session()->has('success') && session()->get('success'))
        <div class="alert alert-info">
           Thao tác thành công
        </div>
    @endif --}}
   

        @if($users->isEmpty())
            <div class="page-header mt-3 align-middle" style="margin-left:10px">
                <p class="text-center mt-3 float-end" >Tìm thấy {{ $count }} sản phẩm cho từ khoá '{{ $keyword }}'</p>
            </div>
        @else
            <div class="page-header mt-3 align-middle" style="margin-left:10px">
                <p class="text-center mt-3 float-end" >Tìm thấy {{ $count }} sản phẩm cho từ khoá '{{ $keyword }}'</p>
            </div>

            <table class="table">
                <thead>
                    <tr>
                        <th>User Name</th>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>GitHub ID</th>
                        <th>GitHub Avatar</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($users as $user)
                        <tr>
                            <td>{{ $user->user_name }}</td>
                            <td>{{ $user->full_name }}</td>
                            <td>{{ $user->email }}</td>
                            <td>{{ $user->role }}</td>
                            <td>{{ $user->github_id }}</td>
                            <td>
                                
                            
                                @if($user->github_avatar)
                                    <img src="{{ Storage::url($user->github_avatar) }}"  width="50">
                                @endif
                            </td>
                            <td>
                                @if($user->image)
                                    <img src="{{ Storage::url($user->image) }}" alt="Profile Image" width="50">
                                @endif
                            </td>
                            <td>
                                <a href="{{ route('admin.users.show', $user->id) }}" class="btn btn-info">View</a>
                                <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-warning">Edit</a>
                                <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" style="display:inline-block;">
                                    @csrf
                                    @method('DELETE')
                                    <button type="submit" class="btn btn-danger" >Delete</button>
                                </form>
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            
        @endif
   
   
</div>
@endsection
