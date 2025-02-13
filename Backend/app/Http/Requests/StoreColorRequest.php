<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreColorRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'hex_code' => [
                'required',
                'regex:/^#([a-fA-F0-9]{6})$/',
                // Nếu đang tạo mới màu (create), kiểm tra tính duy nhất của hex_code
                'unique:colors,hex_code'
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'hex_code.required' => 'Mã màu không đc để trống',
            'hex_code.regex' => 'Mã màu phải đúng định dạng',
            'hex_code.unique' => 'Mã màu đã tồn tại',
        ];
    }
}
