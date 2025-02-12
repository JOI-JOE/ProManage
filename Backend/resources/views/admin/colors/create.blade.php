@extends('admin.layouts.master')
@section('content')

<div class="container">
    <div class="page-header mt-3" style="margin: 12px">
        <h3 class="fw-bold mb-3">Tables</h3>
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
            <a href="#">Tables</a>
          </li>
          <li class="separator">
            <i class="icon-arrow-right"></i>
          </li>
          <li class="nav-item">
            <a href="{{ route('admin.colors.index') }}">Color</a>
          </li>
          <li class="separator">
            <i class="icon-arrow-right"></i>
          </li>
          <li class="nav-item">
            <a href="#">Create</a>
          </li>
        </ul>
      </div>
      {{-- @if ($errors->any())
    <div class="alert alert-danger">
        <ul>
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
@endif  --}}
{{-- @if (session('error'))
    <div class="alert alert-danger">
        {{ session('error') }}
    </div>
@endif

@if (session('success'))
    <div class="alert alert-success">
        {{ session('success') }}
    </div>
@endif --}}

    <form action="{{ route('admin.colors.store') }}" method="POST" >
       @csrf
        <div class="form-group">
            <label for="color">Hex_code</label>
            <input type="text" name="hex_code" class="form-control"  >
             @error('hex_code')
             <span class="text-danger">{{ $message }}</span>
            @enderror
        </div>



        <button type="submit" class="btn btn-primary" style="margin-left: 10px">Submit</button>
    </form>
</div>
@endsection
