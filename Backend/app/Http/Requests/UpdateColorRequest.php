<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateColorRequest extends FormRequest
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
                'regex:/^#([a-fA-F0-9]{6})$/', // Chỉ chấp nhận mã màu HEX hợp lệ
                Rule::unique('colors', 'hex_code')->ignore($this->route('color')), // Bỏ qua ID đang cập nhật
            ],
        ];
    }
    public function messages(): array
    {
        return [
            'hex_code.required' => 'Vui lòng nhập mã màu.',
            'hex_code.regex' => 'Mã màu không hợp lệ. Ví dụ: #FF5733.',
            'hex_code.unique' => 'Mã màu này đã tồn tại, vui lòng chọn mã khác.',
        ];
    }
}
