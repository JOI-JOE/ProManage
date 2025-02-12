



@extends('admin.layouts.master')
@section('content')
<div class="container">
    @if (session()->has('success') && session()->get('success'))
        <div class="alert alert-info">
           Thao tác thành công
        </div>
    @endif

    @if(session('error'))
        <div class="alert alert-danger">
            {{ session('error') }}
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
            <a href="{{ route('admin.users.index') }}">User</a>
          </li>
          <li class="separator">
            <i class="icon-arrow-right"></i>
          </li>
          <li class="nav-item">
            <a href="#">Edit</a>
          </li>
        </ul>
      </div>
    <form action="{{ route('admin.users.update', $user->id) }}" method="POST" enctype="multipart/form-data">
        @csrf
        @method('PUT')
        <div class="form-group">
            <label for="user_name">User Name</label>
            <input type="text" name="user_name" class="form-control" value="{{ $user->user_name }}">
            @error('user_name')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" name="full_name" class="form-control" value="{{ $user->full_name }}" required>
            @error('full_name')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" class="form-control" value="{{ $user->email }}" required>
            @error('email')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" name="password" class="form-control" value="{{ $user->password }}">
            <small>Leave blank if you don't want to change the password</small>
            @error('password')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="role">Role</label>
            <select name="role" class="form-control">
                <option value="member" {{ $user->role == 'member' ? 'selected' : '' }}>Member</option>
                <option value="admin" {{ $user->role == 'admin' ? 'selected' : '' }}>Admin</option>
            </select>
            @error('role')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="github_id">GitHub ID</label>
            <input type="text" name="github_id" class="form-control" value="{{ $user->github_id }}">
            @error('github_id')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="github_avatar">GitHub Avatar</label>
            <input type="file" name="github_avatar" class="form-control">
            @if($user->github_avatar)
                <img src="{{ Storage::url($user->github_avatar) }}" alt="GitHub Avatar" width="100">
            @endif
            @error('github_avatar')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="image">Profile Image</label>
            <input type="file" name="image" class="form-control">
            @if($user->image)
                <img src="{{ Storage::url($user->image) }}" alt="Profile Image" width="100">
            @endif
            @error('image')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
          <label for="activity_block" class="col-4 col-form-label">BLock?</label>
          <div class="col-8">
              <input type="checkbox" class="form-checkbox" @checked($user->activity_block) value="1"
                  name="activity_block" id="activity_block" />
          </div>
      </div>
        <button type="submit" class="btn btn-primary" style="margin-left: 10px">Update</button>
    </form>
</div>

@endsection

