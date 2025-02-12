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
                    <a href="#">Color</a>
                </li>
            </ul>
        </div>
        <a href="{{ route('admin.colors.create') }}" class="btn btn-primary mb-3 " style="margin-left: 10px">Add New
            Color</a>

        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>HEX CODE</th>

                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($data as $color)
                    <tr>
                        <td>{{ $color->id }}</td>
                        <td><span style="background-color: {{ $color->hex_code }}; padding: 10px 50px;"></span></td>



                        <td>
                            {{-- <a href="{{ route('colors.show', $color->id) }}" class="btn btn-info">View</a> --}}
                            <a href="{{ route('admin.colors.edit', $color->id) }}" class="btn btn-warning">Edit</a>
                            <form action="{{ route('admin.colors.destroy', $color->id) }}" method="POST"
                                style="display:inline-block;">
                                @csrf
                                @method('DELETE')
                                <button type="submit" class="btn btn-danger" onclick="return confirm('có chắc xóa không')">Delete</button>
                            </form>
                        </td>
                    </tr>
                @endforeach
            </tbody>
        </table>
        {{ $data->links() }}
    </div>
@endsection
