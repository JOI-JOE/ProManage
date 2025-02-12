<?php

namespace App\Exports;

use App\Models\User;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class UsersExport implements FromCollection, WithHeadings
{
    /**
    * @return \Illuminate\Support\Collection
    */
    public function collection()
    {
        return User::all();
    }

    public function headings(): array
    {
        return [
            '#',
            'UserName',
            'FullName',
            'Initials',
            'Image',
            'Email',
            'Password',
            'Role',
            'Block',
            'Github ID',
            'Github Avatar',
            'Created at',
            'Updated at',
           
       
            
            
        ];
    }
}
