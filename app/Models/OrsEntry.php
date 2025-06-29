<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OrsEntry extends Model
{
    protected $fillable = [
        'incoming_dv_id',
        'ors_number',
        'fund_source',
        'uacs',
    ];

    public function incomingDv()
    {
        return $this->belongsTo(IncomingDv::class);
    }
}
