@extends('admin.layouts.master')

@section('content')

<div class="container">
    <div class="page-header mt-3" style="margin: 12px">
        <h3 class="fw-bold mb-3">Edit Settings</h3>
        <ul class="breadcrumbs mb-3">
            <li class="nav-home">
                <a href="">
                    <i class="icon-home"></i>
                </a>
            </li>
            <li class="separator">
                <i class="icon-arrow-right"></i>
            </li>
            <li class="nav-item">
                <a href="#">Settings</a>
            </li>
            <li class="separator">
                <i class="icon-arrow-right"></i>
            </li>
            <li class="nav-item">
                <a href="{{ route('admin.settings.index') }}">Settings List</a>
            </li>
            <li class="separator">
                <i class="icon-arrow-right"></i>
            </li>
            <li class="nav-item">
                <a href="#">Edit</a>
            </li>
        </ul>
    </div>

    <!-- Form chỉnh sửa -->
    <form action="{{ route('admin.settings.update', $setting->id) }}" method="POST" enctype="multipart/form-data">

        @method('PUT')

        <div class="form-group">
            <label for="site_name">Site_name</label>
            <input type="text" name="site_name" class="form-control" value="{{ old('site_name', $setting->site_name) }}" required>
            @error('site_name')
                <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="logo">Logo</label>
            <input type="file" name="logo" class="form-control" value="{{ old('logo', $setting->logo) }}" >
            @error('logo')
                <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="description">Description</label>
            <input type="text" name="description" class="form-control" value="{{ old('description', $setting->description) }}" required>
            @error('description')
                <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>
        <div class="form-group">
            <label for="contact_email">Contact_email</label>
            <input type="text" name="contact_email" class="form-control" value="{{ old('contact_email', $setting->contact_email) }}" required>
            @error('contact_email')
                <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>

        <button type="submit" class="btn btn-primary" style="margin-left: 10px">Update</button>
    </form>
</div>

@endsection
