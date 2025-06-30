<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\IncomingDvController;
use App\Http\Controllers\StatisticsController;
use Illuminate\Support\Facades\Auth;

Route::get('/check-db', function () {
    try {
        $dbName = DB::connection()->getDatabaseName();
        return "Connected to database: $dbName";
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});
Route::get('/', function () {
    if (Auth::check()) {
        return Inertia::render('LandingPage');
    }
    
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
]);
});

Route::get('/home', function () {
    if (Auth::check()) {
        return redirect('/incoming-dvs');
    }
    
    return redirect('/');
    return redirect('/');
});

// Redirect dashboard route to main app for backwards compatibility
Route::get('/dashboard', function () {
    return redirect('/incoming-dvs');
})->middleware(['auth'])->name('dashboard');

Route::middleware(['auth'])->group(function () {
    // Statistics page
    Route::get('/statistics', [StatisticsController::class, 'index'])->name('statistics');
    
    // Incoming DVs routes
    Route::get('/incoming-dvs', [IncomingDvController::class, 'index'])->name('incoming-dvs');
    Route::get('/incoming-dvs/new', fn () => Inertia::render('IncomingDvForm'))->name('incoming-dvs.new');
    Route::post('/incoming-dvs', [IncomingDvController::class, 'store'])->name('incoming-dvs.store');
    Route::put('/incoming-dvs/{id}', [IncomingDvController::class, 'update'])->name('incoming-dvs.update');
    Route::put('/incoming-dvs/{id}/status', [IncomingDvController::class, 'updateStatus'])->name('incoming-dvs.update-status');
    Route::post('/incoming-dvs/{id}/rts-norsa', [IncomingDvController::class, 'updateRtsNorsa'])->name('incoming-dvs.rts-norsa');
    Route::post('/incoming-dvs/{id}/cash-allocation', [IncomingDvController::class, 'updateCashAllocation'])->name('incoming-dvs.cash-allocation');
    Route::post('/incoming-dvs/{id}/box-c', [IncomingDvController::class, 'updateBoxCStatus'])->name('incoming-dvs.box-c');
    Route::post('/incoming-dvs/{dv}/approval-out', [IncomingDvController::class, 'updateApprovalOut'])->name('incoming-dvs.approval-out');
    Route::post('/incoming-dvs/{dv}/approval-in', [IncomingDvController::class, 'updateApprovalIn'])->name('incoming-dvs.approval-in');
    Route::post('/incoming-dvs/initialize-history', [IncomingDvController::class, 'initializeTransactionHistory'])->name('incoming-dvs.initialize-history');
    Route::post('/incoming-dvs/{dv}/indexing', [IncomingDvController::class, 'updateIndexing'])->name('incoming-dvs.indexing');
    Route::post('/incoming-dvs/{dv}/payment-method', [IncomingDvController::class, 'updatePaymentMethod'])->name('incoming-dvs.payment-method');
    Route::post('/incoming-dvs/{dv}/payroll-in', [IncomingDvController::class, 'updatePayrollIn'])->name('incoming-dvs.payroll-in');
    Route::post('/incoming-dvs/{dv}/engas', [IncomingDvController::class, 'updateEngas'])->name('incoming-dvs.engas');
    Route::post('/incoming-dvs/{dv}/cdj', [IncomingDvController::class, 'updateCdj'])->name('incoming-dvs.cdj');
    Route::post('/incoming-dvs/{dv}/lddap-certify', [IncomingDvController::class, 'certifyLddap'])->name('incoming-dvs.lddap-certify');
    Route::get('/dv/{dv}/details', [IncomingDvController::class, 'showDetails'])->name('dv.details');
    Route::get('/incoming-dvs/{dv}/download', [IncomingDvController::class, 'downloadDv'])->name('incoming-dvs.download');
    
    // Profile routes
    Route::get('/profile', [ProfileController::class, 'show'])->name('profile.show');
    Route::post('/profile/update', [ProfileController::class, 'update'])->name('profile.update');
});

// Include authentication routes (email verification, etc.)
require __DIR__.'/auth.php';
