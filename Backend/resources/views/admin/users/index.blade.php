@extends('admin.layouts.master')
@section('content')


<div class="container">
    @if (session()->has('success') && session()->get('success'))
        <div class="alert alert-info">
           Thao tác thành công
        </div>
    @endif
    <div class="page-header mt-3" style="margin: 12px">
        <h3 class="fw-bold mb-3">Tables</h3>
        <ul class="breadcrumbs mb-3">
          <li class="nav-home">
            <a href="{{ route('admin.') }}">
              <i class="icon-home"></i>
            </a>
          </li>
          <li class="separator">
            <i class="icon-arrow-right"></i>
          </li>
          <li class="nav-item">
            <a href="#">Tables</a>
          </li>
          <li class="separator">
            <i class="icon-arrow-right"></i>
          </li>
          <li class="nav-item">
            <a href="#">User</a>
          </li>
        </ul>
      </div>
    <a href="{{ route('admin.users.create') }}" class="btn btn-primary mb-3 " style="margin-left: 10px">Add New User</a>
    <a href="{{ route('admin.users.export') }}" class="btn btn-success mb-3 float-end" style="margin-right: 10px">Export</a>
    <a href="{{ route('admin.users.import') }}" class="btn btn-success mb-3 float-end" style="margin-right: 10px">Import</a>
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
                <th>Block</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($data as $user)
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
                      @if ($user->activity_block)
                          <span class="badge bg-primary">YES</span>
                      @else
                          <span class="badge bg-danger">NO</span>
                      @endif
                    </td>
                    <td>
                        <a href="{{ route('admin.users.show', $user->id) }}" class="btn btn-info">View</a>
                        <a href="{{ route('admin.users.edit', $user->id) }}" class="btn btn-warning">Edit</a>
                        <form action="{{ route('admin.users.destroy', $user->id) }}" method="POST" style="display:inline-block;">
                            @csrf
                            @method('DELETE')
                            <button type="submit"  onclick="return confirm('ARE YOU SURE?')" class="btn btn-danger" >Delete</button>
                        </form>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
    {{ $data->links() }}
</div>
@endsection
