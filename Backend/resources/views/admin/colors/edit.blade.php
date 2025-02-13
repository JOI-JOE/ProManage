@extends('admin.layouts.master')

@section('content')

<div class="container">
    <div class="page-header mt-3" style="margin: 12px">
        <h3 class="fw-bold mb-3">Edit Color</h3>
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
                <a href="#">Colors</a>
            </li>
            <li class="separator">
                <i class="icon-arrow-right"></i>
            </li>
            <li class="nav-item">
                <a href="{{ route('admin.colors.index') }}">Color List</a>
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
    <form action="{{ route('admin.colors.update', $color->id) }}" method="POST">
        @csrf
        @method('PUT')

        <div class="form-group">
            <label for="hex_code">Hex Code</label>
            <input type="text" name="hex_code" class="form-control" value="{{ old('hex_code', $color->hex_code) }}" required>
            @error('hex_code')
                <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>

        <button type="submit" class="btn btn-primary" style="margin-left: 10px">Update</button>
    </form>
</div>

@endsection
