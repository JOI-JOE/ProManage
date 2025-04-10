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
                    <a href="#">Settings</a>
                </li>
            </ul>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Site_name</th>
                    <th>Logo</th>

                    <th>Description</th>

                    <th>Contact_email</th>
                </tr>
            </thead>
            <tbody>
                    <tr>
                        <td>{{ $setting->id}}</td>
                        <td>{{ $setting->site_name }}</td>
                        <td><img src="{{Storage::url($setting->logo )}}" alt="" width="100"></td>
                        <td>{{ $setting->description }}</td>
                        <td>{{ $setting->contact_email }}</td>

                        <td>
                            {{-- <a href="{{ route('colors.show', $color->id) }}" class="btn btn-info">View</a> --}}
                            <a href="{{ route('admin.settings.edit', $setting->id) }}" class="btn btn-warning">Edit</a>

                        </td>
                    </tr>

            </tbody>
        </table>
    </div>
@endsection
