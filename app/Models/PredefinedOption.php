<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PredefinedOption extends Model
{
    protected $fillable = [
        'type',
        'value',
        'is_predefined'
    ];

    protected $casts = [
        'is_predefined' => 'boolean'
    ];

    // Get all options for a specific type
    public static function getOptionsForType($type)
    {
        return self::where('type', $type)
            ->orderBy('is_predefined', 'desc') // Predefined first
            ->orderBy('value')
            ->pluck('value');
    }

    // Add new option if it doesn't exist
    public static function addOptionIfNotExists($type, $value)
    {
        if (!empty($value) && !self::where('type', $type)->where('value', $value)->exists()) {
            self::create([
                'type' => $type,
                'value' => $value,
                'is_predefined' => false
            ]);
        }
    }

    // Constants for types
    const TYPE_FUND_SOURCE = 'fund_source';
    const TYPE_TRANSACTION_TYPE = 'transaction_type';
    const TYPE_IMPLEMENTING_UNIT = 'implementing_unit';
}
