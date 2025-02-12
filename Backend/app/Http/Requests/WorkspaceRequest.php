<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class WorkspaceRequest extends FormRequest
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
    public function rules(Request $request): array
    {
        $workspaceId = $request->route('workspace');

        $rules = [
            'name' => 'required|string|max:100',
            'id_member_creator' => [
                Rule::exists('users', 'id'),
            ],
            'display_name' => [
                'required',
                'string',
                'max:100',
                // Rule unique đã được sửa
                Rule::unique('workspaces', 'display_name')->ignore($workspaceId),
            ],
            'desc' => 'nullable|string|max:255',
            'logo_hash' => 'nullable|string|max:255',
            'logo_url' => 'nullable|string|max:255',
            'permission_level' => [
                Rule::in(['private', 'public']),
            ],
            'board_invite_restrict' => [
                Rule::in(['any', 'admins', 'members', 'owner']),
            ],
            'org_invite_restrict' => 'nullable|json',
            'board_delete_restrict' => 'nullable|json',
            'board_visibility_restrict' => 'nullable|json',
            'team_type' => 'nullable|string|max:255',
        ];

        return $rules;
    }

    /**
     * Get the error messages for the defined validation rules.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'The name field is required.',
            'name.string' => 'The name must be a string.',
            'name.max' => 'The name may not be greater than 100 characters.',
            'display_name.required' => 'The display name field is required.',
            'display_name.string' => 'The display name must be a string.',
            'display_name.max' => 'The display name may not be greater than 100 characters.',
            'display_name.unique' => 'The display name has already been taken.',
        ];
    }
}
