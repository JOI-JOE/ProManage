@extends('admin.layouts.master')
@section('content')

<div class="container">
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
            <a href="#">Create</a>
          </li>
        </ul>
      </div>
    <form action="{{ route('admin.users.store') }}" method="POST" enctype="multipart/form-data">
        @csrf
        <div class="form-group">
            <label for="user_name">User Name</label>
            <input type="text" name="user_name" class="form-control" value="{{ old('user_name') }}">
            @error('user_name')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="full_name">Full Name</label>
            <input type="text" name="full_name" class="form-control" value="{{ old('full_name') }}" >
            @error('full_name')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="email">Email</label>
            <input type="email" name="email" class="form-control" value="{{ old('email') }}" >
            @error('email')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" name="password" class="form-control" required  value="{{ old('password') }}">
            @error('password')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="role">Role</label>
            <select name="role" class="form-control">
                <option value="member">Member</option>
                <option value="admin">Admin</option>
            </select>
            @error('role')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="github_id">GitHub ID</label>
            <input type="text" name="github_id" class="form-control">
            @error('github_id')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="github_avatar">GitHub Avatar</label>
            <input type="file" name="github_avatar" class="form-control" value="{{ old('github_avatar') }}">
            @error('github_avatar')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="image">Profile Image</label>
            <input type="file" name="image" class="form-control" value="{{ old('image') }}">
            @error('image')
            <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
          <label for="activity_block" class="col-4 col-form-label">Block?</label>
          <div class="col-8">
              <input type="checkbox" class="form-checkbox" value="1" name="activity_block" id="activity_block" />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" style="margin-left: 10px">Submit</button>
    </form>
</div>
@endsection
