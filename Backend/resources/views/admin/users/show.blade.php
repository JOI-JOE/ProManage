

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
            <a href="#">Show</a>
          </li>
        </ul>
      </div>
    <div class="card">
        <div class="card-header">
            <h2>{{ $user->full_name }}</h2>
        </div>
        <div class="card-body">
            <p><strong>User Name:</strong> {{ $user->user_name }}</p>
            <p><strong>Email:</strong> {{ $user->email }}</p>
            <p><strong>Role:</strong> {{ $user->role }}</p>
            <p><strong>GitHub ID:</strong> {{ $user->github_id }}</p>
            <p><strong>GitHub Avatar:</strong></p>
            @if($user->github_avatar)
                <img src="{{ Storage::url($user->github_avatar) }}" alt="GitHub Avatar" width="100">
            @endif
            <p><strong>Profile Image:</strong></p>
            @if($user->image)
                <img src="{{ Storage::url($user->image) }}" alt="Profile Image" width="100">
            @endif
            <p><strong>Block:</strong></p>
            @if ($user->activity_block)
                <span class="badge bg-primary">YES</span>
            @else
                <span class="badge bg-danger">NO</span>
            @endif
            {{-- <p><strong>Email Verified At:</strong> {{ $user->email_verified_at }}</p> --}}
        </div>
    </div>
</div>

@endsection

