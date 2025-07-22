<?php

namespace App\Actions\Fortify;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'role' => ['required', 'string'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => $this->passwordRules(),
        ])->validate();

        // Format names to ensure proper capitalization (First Letter Capital, rest lowercase)
        $formattedFirstName = ucwords(strtolower(trim($input['first_name'])));
        $formattedLastName = ucwords(strtolower(trim($input['last_name'])));
        $fullName = $formattedFirstName . ' ' . $formattedLastName;

        return User::create([
            'name' => $fullName,
            'first_name' => $formattedFirstName,
            'last_name' => $formattedLastName,
            'role' => $input['role'],
            'email' => $input['email'],
            'password' => Hash::make($input['password']),
        ]);
    }
}
