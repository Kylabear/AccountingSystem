<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => session('status'),
        ]);
    }

    /**
     * Show the user's profile page.
     */
    public function show(Request $request): Response
    {
        return Inertia::render('Profile', [
            'auth' => [
                'user' => $request->user()
            ]
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request): RedirectResponse
    {
        Log::info('Profile update request received', [
            'has_file' => $request->hasFile('profile_image'),
            'files' => $request->allFiles(),
            'all_data' => $request->all()
        ]);

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'profile_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,gif', 'max:2048'],
        ]);

        $user = $request->user();
        
        // Update name
        $user->name = $request->name;
        
        // Handle profile image upload
        if ($request->hasFile('profile_image')) {
            Log::info('Processing profile image upload');
            
            // Delete old profile image if exists
            if ($user->profile_image && Storage::disk('public')->exists($user->profile_image)) {
                Storage::disk('public')->delete($user->profile_image);
                Log::info('Deleted old profile image: ' . $user->profile_image);
            }
            
            // Store new profile image
            $path = $request->file('profile_image')->store('profile-images', 'public');
            $user->profile_image = $path;
            Log::info('Stored new profile image: ' . $path);
        } else {
            Log::info('No profile image file in request');
        }
        
        $user->save();
        Log::info('User profile updated successfully');

        return Redirect::route('profile.show')->with('success', 'Profile updated successfully!');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }
}
