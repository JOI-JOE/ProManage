<?php

namespace App\Http\Controllers\Admin;

use App\Models\Color;
use App\Http\Requests\StoreColorRequest;
use App\Http\Requests\UpdateColorRequest;
use App\Http\Controllers\Controller;

class ColorController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $data= Color::query()->latest('id')->paginate(5);
        return view('admin.colors.index',compact('data'));

        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return view('admin.colors.create');
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreColorRequest $request)
    {
        try {
            //code...
            // $request->validate([

            //     'hex_code' => 'required|unique:colors|max:7'
            // ]);

            Color::create($request->validated());
            return redirect()->route('admin.colors.index')->with('success', true);
           } catch (\Throwable $th) {
            return back()->with('success', false);


           }
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(Color $color)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Color $color)
    {
        return view('admin.colors.edit', compact('color'));
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateColorRequest $request, Color $color)
    {
        try {
            //code...


            $color->update($request->validated());
            return redirect()->route('admin.colors.index')->with('success', true);
           } catch (\Throwable $th) {
            return back()->with('success', false);

           }
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Color $color)
    {
        try {
            $color->delete();
            return redirect()->route('admin.colors.index')->with('success', true);
            //code...
        } catch (\Throwable $th) {
            return back()->with('success',false);

            //throw $th;
        }
        //
    }
}
