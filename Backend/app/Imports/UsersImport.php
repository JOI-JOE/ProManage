<?php

namespace App\Imports;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class UsersImport implements ToCollection, WithHeadingRow
{
    /**
    * @param Collection $collection
    */
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) 
        {

            $user = User::where('email',$row['email'])->first();
            if($user){
                $user->update([
                    'user_name'    => $row['user_name'],
                    'full_name'    => $row['full_name'],
                    'image'        => $row['image'],
                    'password'     => bcrypt($row['password']),
                    'role'         => $row['role'],
                    'github_id'    => $row['github_id'],
                    'github_avatar'=> $row['github_avatar'],
                ]);
            }else{
                User::create([
                    'user_name'    => $row['user_name'],
                    'full_name'    => $row['full_name'],
                    'image'        => $row['image'],
                    'email'        => $row['email'],
                    'password'     => bcrypt($row['password']),
                    'role'         => $row['role'],
                    'github_id'    => $row['github_id'],
                    'github_avatar'=> $row['github_avatar'],
                ]);
            }
           
            
        }
    }
}
